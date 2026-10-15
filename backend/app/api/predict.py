import asyncio
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from ..services.model_loader import model_manager
from ..services.audio_processor import process_audio_pipeline
from ..services.inference_service import run_window_inference
from ..services.result_aggregator import aggregate_recording_results
from ..schemas.prediction import PredictionResponse
from ..utils.file_validation import validate_file_content

logger = logging.getLogger("testyourbreath.predict")
router = APIRouter()

# Global lock to synchronize inference requests on shared CPU/GPU model instance
_inference_lock = asyncio.Lock()


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Analisis Suara Pernapasan"
)
async def predict_respiratory_sound(
    file: UploadFile = File(..., description="File rekaman suara pernapasan (format WAV, MP3, M4A)"),
    mode: str = Form("consensus", description="Mode agregasi keputusan ('consensus', 'maximum', 'average')")
) -> PredictionResponse:
    """
    Menerima file rekaman pernapasan, memvalidasi format dan integritas sinyal,
    memotong menjadi segmen window 2,7 detik (overlap 50%), menjalankan inferensi AST,
    dan mengembalikan klasifikasi Normal/Abnormal berdasarkan ambang batas model.
    """
    if not model_manager.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model TestYourBreath AST belum siap atau sedang dimuat. Silakan coba beberapa saat lagi."
        )

    filename = file.filename or "unknown.wav"
    logger.info(f"Menerima permintaan analisis untuk file: {filename}")

    # 1. Validasi dan baca isi file audio
    audio_bytes = await validate_file_content(file)

    try:
        # 2. Preprocessing audio (mono, 16kHz resampling, windowing)
        metadata = model_manager.get_metadata()
        windows, duration_seconds, sample_rate = process_audio_pipeline(audio_bytes, metadata)
        
        logger.info(
            f"File '{filename}' ({duration_seconds}s) berhasil dibagi menjadi {len(windows)} window."
        )

        # 3. Eksekusi inferensi model AST secara thread-safe
        async with _inference_lock:
            # Jalankan inferensi CPU-bound di thread pool agar tidak memblok event loop FastAPI
            window_scores = await asyncio.to_thread(run_window_inference, windows)

        # 4. Agregasi hasil window menjadi kesimpulan rekaman
        result = aggregate_recording_results(
            filename=filename,
            duration_seconds=duration_seconds,
            sample_rate=sample_rate,
            windows=window_scores,
            metadata=metadata,
            aggregation_mode=mode
        )

        logger.info(
            f"Analisis '{filename}' selesai. Hasil: {result.predicted_label} "
            f"(Skor: {result.abnormal_model_score:.4f}, Threshold: {result.threshold:.4f})"
        )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Kesalahan internal saat menganalisis '{filename}': {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Terjadi kesalahan internal pada server saat memproses suara pernapasan. Silakan coba kembali."
        )
    finally:
        # Bersihkan buffer file upload
        try:
            await file.close()
        except Exception:
            pass

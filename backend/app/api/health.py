from fastapi import APIRouter
from ..services.model_loader import model_manager
from ..schemas.prediction import HealthResponse, ModelInfoResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """
    Pemeriksaan status server dan kesiapan model AST di memori.
    """
    is_ready = model_manager.is_loaded
    meta = model_manager.get_metadata()
    
    return HealthResponse(
        status="ok" if is_ready else "degraded",
        model_loaded=is_ready,
        model_name=meta.get("model_id", "TestYourBreath AST V6"),
        device=str(model_manager.device),
        threshold=meta.get("threshold"),
        class_names=meta.get("class_names")
    )


@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info() -> ModelInfoResponse:
    """
    Mengambil konfigurasi rinci arsitektur, parameter, dan metadata model yang sedang aktif.
    """
    meta = model_manager.get_metadata()
    
    return ModelInfoResponse(
        model_id=meta.get("model_id", "MIT/ast-finetuned-audioset-10-10-0.4593"),
        architectures=["ASTForAudioClassification"],
        sample_rate=int(meta.get("sample_rate", 16000)),
        window_seconds=float(meta.get("window_seconds", 2.7)),
        overlap=float(meta.get("overlap", 0.5)),
        stride_seconds=float(meta.get("stride_seconds", 1.35)),
        max_length=int(meta.get("max_length", 1024)),
        num_mel_bins=int(meta.get("num_mel_bins", 128)),
        recording_aggregation=meta.get("recording_aggregation", "maximum"),
        threshold=float(meta.get("threshold", 0.957912266254425)),
        class_names=meta.get("class_names", ["Normal", "Abnormal"]),
        device=str(model_manager.device),
        num_parameters=model_manager.num_parameters,
        model_loaded=model_manager.is_loaded
    )

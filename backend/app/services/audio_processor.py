import io
import math
from typing import List, Dict, Any, Tuple
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, butter, filtfilt
from fastapi import HTTPException, status

from ..core.config import settings


def read_audio_from_bytes(audio_bytes: bytes) -> Tuple[np.ndarray, int]:
    """
    Membaca byte audio menggunakan SoundFile (WAV, MP3, FLAC, OGG)
    dengan fallback otomatis ke PyAV (M4A, AAC, MP4 audio).
    Mengembalikan numpy array float32 dan sample rate asli.
    """
    # 1. Coba SoundFile terlebih dahulu
    try:
        with io.BytesIO(audio_bytes) as audio_file:
            data, original_sr = sf.read(audio_file, dtype="float32")
            return data, original_sr
    except Exception:
        pass

    # 2. Fallback ke PyAV untuk container M4A / AAC / MP4
    try:
        import av
        with io.BytesIO(audio_bytes) as audio_file:
            container = av.open(audio_file)
            audio_stream = next((s for s in container.streams if s.type == "audio"), None)
            if audio_stream is None:
                raise ValueError("Tidak ditemukan aliran audio dalam file kontainer.")

            original_sr = audio_stream.rate
            frames = []
            for frame in container.decode(audio_stream):
                frames.append(frame.to_ndarray())

            if not frames:
                raise ValueError("Tidak ada frame audio yang berhasil didekode.")

            # Gabungkan frames secara temporal (axis=1)
            all_audio = np.concatenate(frames, axis=1)

            # Konversi dan normalisasi ke float32 rentang [-1.0, 1.0]
            if all_audio.dtype == np.int16:
                all_audio = (all_audio.astype(np.float32) / 32768.0)
            elif all_audio.dtype == np.int32:
                all_audio = (all_audio.astype(np.float32) / 2147483648.0)
            else:
                all_audio = all_audio.astype(np.float32)

            # Ubah shape dari (channels, total_samples) menjadi (total_samples, channels)
            if all_audio.ndim == 2:
                all_audio = all_audio.T
                if all_audio.shape[1] == 1:
                    all_audio = all_audio.squeeze(axis=-1)

            return all_audio, original_sr
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gagal mendekode data audio. Pastikan file audio valid (WAV, MP3, atau M4A). Detail: {str(e)}"
        )


def convert_to_mono(audio: np.ndarray) -> np.ndarray:
    """
    Mengonversi audio multi-channel (stereo, quad, dll.) menjadi single-channel mono.
    """
    if audio.ndim == 1:
        return audio
    elif audio.ndim == 2:
        # Rata-rata across channels
        return np.mean(audio, axis=-1, dtype=np.float32)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dimensi audio tidak didukung: {audio.ndim} dimensi."
        )


def resample_audio(audio: np.ndarray, original_sr: int, target_sr: int = 16000) -> np.ndarray:
    """
    Melakukan resampling waveform ke sample rate target (16.000 Hz) menggunakan polyphase filtering.
    """
    if original_sr == target_sr:
        return audio
    
    # Hitung gcd untuk rasio integer up/down pada resample_poly
    gcd = math.gcd(int(original_sr), int(target_sr))
    up = target_sr // gcd
    down = original_sr // gcd
    
    resampled = resample_poly(audio, up, down).astype(np.float32)
    return resampled


def apply_respiratory_bandpass_filter(
    audio: np.ndarray,
    sr: int = 16000,
    lowcut: float = 50.0,
    highcut: float = 2500.0,
    order: int = 4
) -> np.ndarray:
    """
    Menerapkan bandpass filter Butterworth orde-4 (50 Hz - 2500 Hz).
    Rentang 50 - 2500 Hz adalah pita frekuensi suara napas klinis (CORSA guidelines).
    Filter ini meredam sub-bass rumble (< 50 Hz) akibat hembusan napas dekat mikrofon
    dan desis frekuensi tinggi (> 2500 Hz) dari kebisingan ruangan.
    """
    # Guard jika panjang sinyal terlalu pendek untuk filtfilt
    padlen = 3 * (order * 2 + 1)
    if len(audio) <= padlen:
        return audio

    nyq = 0.5 * sr
    low = max(0.001, min(lowcut / nyq, 0.99))
    high = max(low + 0.01, min(highcut / nyq, 0.99))

    try:
        b, a = butter(order, [low, high], btype="band")
        filtered = filtfilt(b, a, audio).astype(np.float32)
        # Pastikan tidak ada NaN yang timbul dari filter numerik
        if np.isfinite(filtered).all():
            return filtered
    except Exception:
        pass

    return audio


def validate_and_clean_audio(audio: np.ndarray, sr: int) -> np.ndarray:
    """
    Validasi integritas nilai numerik, durasi, dan tingkat amplitudo audio.
    """
    if not np.isfinite(audio).all():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File audio mengandung nilai tidak valid (NaN atau Infinity)."
        )
    
    duration = len(audio) / sr
    if duration < settings.MIN_AUDIO_DURATION_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Durasi audio terlalu pendek ({duration:.2f} detik). "
                f"Minimal durasi yang dibutuhkan adalah {settings.MIN_AUDIO_DURATION_SECONDS} detik."
            )
        )
    
    if duration > settings.MAX_AUDIO_DURATION_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Durasi audio terlalu panjang ({duration:.2f} detik). "
                f"Maksimal durasi yang diizinkan adalah {settings.MAX_AUDIO_DURATION_SECONDS} detik."
            )
        )
    
    # Periksa tingkat energi/RMS
    rms = np.sqrt(np.mean(np.square(audio)))
    if rms < 1e-5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File audio tidak memiliki suara yang terdengar (amplitudo hening/diam mutlak)."
        )
    
    return audio


def slice_into_windows(
    audio: np.ndarray,
    sr: int = 16000,
    window_seconds: float = 2.7,
    overlap: float = 0.5
) -> List[Dict[str, Any]]:
    """
    Membagi audio mono 16 kHz menjadi window-window berdurasi 2,7 detik (43.200 sampel)
    dengan overlap 50% (stride 1,35 detik = 21.600 sampel).
    
    Mengembalikan daftar window yang berisi informasi waktu awal, waktu akhir, dan array window.
    """
    window_samples = int(round(window_seconds * sr))
    stride_seconds = window_seconds * (1.0 - overlap)
    stride_samples = int(round(stride_seconds * sr))
    total_samples = len(audio)
    
    windows: List[Dict[str, Any]] = []
    
    # Kasus 1: Durasi audio lebih pendek dari satu window (misal 1 - 2.6 detik)
    if total_samples < window_samples:
        # Zero padding di sisi kanan
        padded = np.zeros(window_samples, dtype=np.float32)
        padded[:total_samples] = audio
        windows.append({
            "window_index": 0,
            "start_seconds": 0.0,
            "end_seconds": round(total_samples / sr, 2),
            "audio": padded
        })
        return windows
    
    # Kasus 2: Durasi audio >= 2.7 detik
    current_start = 0
    w_idx = 0
    
    while current_start + window_samples <= total_samples:
        window_slice = audio[current_start : current_start + window_samples]
        start_sec = round(current_start / sr, 2)
        end_sec = round((current_start + window_samples) / sr, 2)
        
        windows.append({
            "window_index": w_idx,
            "start_seconds": start_sec,
            "end_seconds": end_sec,
            "audio": window_slice
        })
        current_start += stride_samples
        w_idx += 1
    
    # Tangani sisa bagian akhir rekaman (tail coverage)
    # Jika sisa setelah window terakhir masih ada dan lebih dari 0.5 detik dari akhir rekaman sebelumnya
    last_covered_sample = current_start - stride_samples + window_samples
    remaining_samples = total_samples - last_covered_sample
    
    if remaining_samples > int(0.2 * sr):  # Lebih dari 0.2 detik belum ter-cover
        end_start = total_samples - window_samples
        if end_start > 0 and (not windows or end_start != (windows[-1]["window_index"] * stride_samples)):
            window_slice = audio[end_start:total_samples]
            windows.append({
                "window_index": w_idx,
                "start_seconds": round(end_start / sr, 2),
                "end_seconds": round(total_samples / sr, 2),
                "audio": window_slice
            })
    
    return windows


def process_audio_pipeline(audio_bytes: bytes, metadata: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], float, int]:
    """
    Pipeline lengkap pemrosesan audio:
    1. Pembacaan bytes
    2. Konversi mono
    3. Resampling ke sample rate model (16 kHz)
    4. Validasi numerik dan durasi
    5. Windowing
    
    Mengembalikan (windows, total_duration_seconds, sample_rate).
    """
    raw_data, orig_sr = read_audio_from_bytes(audio_bytes)
    mono_data = convert_to_mono(raw_data)
    
    target_sr = int(metadata.get("sample_rate", settings.DEFAULT_SAMPLE_RATE))
    resampled_data = resample_audio(mono_data, orig_sr, target_sr)
    clean_audio = validate_and_clean_audio(resampled_data, target_sr)
    
    # Filter bandpass klinis untuk suara napas (50 Hz - 2500 Hz)
    filtered_audio = apply_respiratory_bandpass_filter(clean_audio, sr=target_sr)
    
    duration_seconds = round(len(filtered_audio) / target_sr, 2)
    
    window_sec = float(metadata.get("window_seconds", settings.DEFAULT_WINDOW_SECONDS))
    overlap_ratio = float(metadata.get("overlap", settings.DEFAULT_OVERLAP))
    
    windows = slice_into_windows(
        filtered_audio,
        sr=target_sr,
        window_seconds=window_sec,
        overlap=overlap_ratio
    )
    
    return windows, duration_seconds, target_sr

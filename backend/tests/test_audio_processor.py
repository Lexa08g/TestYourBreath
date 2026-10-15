import io
import numpy as np
import soundfile as sf
import pytest
from fastapi import HTTPException

from app.services.audio_processor import (
    convert_to_mono,
    resample_audio,
    validate_and_clean_audio,
    slice_into_windows,
    read_audio_from_bytes,
    apply_respiratory_bandpass_filter,
)


def test_convert_to_mono():
    # 2D stereo array
    stereo = np.ones((16000, 2), dtype=np.float32)
    stereo[:, 1] = 0.5
    mono = convert_to_mono(stereo)
    assert mono.ndim == 1
    assert len(mono) == 16000
    assert np.isclose(mono[0], 0.75)


def test_resample_audio():
    # 44100 Hz signal down to 16000 Hz
    t = np.linspace(0, 1.0, 44100, endpoint=False)
    sine = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    resampled = resample_audio(sine, original_sr=44100, target_sr=16000)
    assert len(resampled) == 16000


def test_slice_into_windows_standard():
    # 5.4 seconds audio at 16kHz = 86,400 samples
    # Window: 2.7s (43,200), Stride: 1.35s (21,600)
    # Windows:
    # 0: 0.0s - 2.7s (0 - 43200)
    # 1: 1.35s - 4.05s (21600 - 64800)
    # 2: 2.7s - 5.4s (43200 - 86400)
    audio = np.random.randn(86400).astype(np.float32)
    windows = slice_into_windows(audio, sr=16000, window_seconds=2.7, overlap=0.5)
    assert len(windows) == 3
    assert windows[0]["start_seconds"] == 0.0
    assert windows[0]["end_seconds"] == 2.7
    assert len(windows[0]["audio"]) == 43200
    assert windows[2]["end_seconds"] == 5.4


def test_slice_into_windows_short_audio_padding():
    # 1.5 seconds audio (24,000 samples)
    audio = np.random.randn(24000).astype(np.float32)
    windows = slice_into_windows(audio, sr=16000, window_seconds=2.7, overlap=0.5)
    assert len(windows) == 1
    # Must be padded to 43,200
    assert len(windows[0]["audio"]) == 43200
    assert windows[0]["start_seconds"] == 0.0
    assert windows[0]["end_seconds"] == 1.5


def test_validate_and_clean_audio_silence():
    # Pure zero audio
    silent_audio = np.zeros(16000, dtype=np.float32)
    with pytest.raises(HTTPException) as exc:
        validate_and_clean_audio(silent_audio, sr=16000)
    assert exc.value.status_code == 400


def test_validate_and_clean_audio_nan():
    nan_audio = np.array([0.1, np.nan, 0.5], dtype=np.float32)
    with pytest.raises(HTTPException) as exc:
        validate_and_clean_audio(nan_audio, sr=16000)
    assert exc.value.status_code == 400


def test_apply_respiratory_bandpass_filter():
    t = np.linspace(0, 1.0, 16000, endpoint=False)
    # Suara napas frekuensi 250 Hz bercampur sub-rumble 10 Hz dan noise 6000 Hz
    breath = np.sin(2 * np.pi * 250 * t).astype(np.float32)
    sub_rumble = (2.0 * np.sin(2 * np.pi * 10 * t)).astype(np.float32)
    high_noise = (0.5 * np.sin(2 * np.pi * 6000 * t)).astype(np.float32)
    noisy_audio = breath + sub_rumble + high_noise

    filtered = apply_respiratory_bandpass_filter(noisy_audio, sr=16000, lowcut=50.0, highcut=2500.0)
    assert len(filtered) == 16000
    assert np.isfinite(filtered).all()
    # Filter harus meredam energi sub-rumble 10 Hz yang besar
    assert np.max(np.abs(filtered)) < np.max(np.abs(noisy_audio))


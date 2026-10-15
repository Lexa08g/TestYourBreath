import io
import numpy as np
import soundfile as sf
import pytest


def generate_test_wav_bytes(duration_sec: float = 3.0, sample_rate: int = 16000) -> bytes:
    """Helper to generate a real WAV file in memory."""
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), endpoint=False)
    # 220Hz harmonic signal
    audio = (0.4 * np.sin(2 * np.pi * 220 * t) + 0.1 * np.random.randn(len(t))).astype(np.float32)
    buffer = io.BytesIO()
    sf.write(buffer, audio, sample_rate, format="WAV")
    return buffer.getvalue()


def generate_test_mp3_bytes(duration_sec: float = 3.0, sample_rate: int = 16000) -> bytes:
    """Helper to generate a real MP3 file in memory."""
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), endpoint=False)
    audio = (0.4 * np.sin(2 * np.pi * 220 * t) + 0.1 * np.random.randn(len(t))).astype(np.float32)
    buffer = io.BytesIO()
    sf.write(buffer, audio, sample_rate, format="MP3")
    return buffer.getvalue()


def test_predict_endpoint_valid_wav(client):
    wav_bytes = generate_test_wav_bytes(duration_sec=3.5, sample_rate=16000)
    files = {"file": ("test_respiratory.wav", wav_bytes, "audio/wav")}
    response = client.post("/api/v1/predict", files=files)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "recording_id" in data
    assert data["filename"] == "test_respiratory.wav"
    assert data["duration_seconds"] == 3.5
    assert data["sample_rate"] == 16000
    assert data["predicted_label"] in ["Normal", "Abnormal"]
    assert data["aggregation_method"] == "maximum"
    assert 0.0 <= data["abnormal_model_score"] <= 1.0
    assert 0.0 <= data["normal_model_score"] <= 1.0
    assert len(data["windows"]) > 0


def test_predict_endpoint_valid_mp3(client):
    mp3_bytes = generate_test_mp3_bytes(duration_sec=3.0, sample_rate=16000)
    files = {"file": ("test_breath.mp3", mp3_bytes, "audio/mpeg")}
    response = client.post("/api/v1/predict", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_breath.mp3"
    assert data["predicted_label"] in ["Normal", "Abnormal"]
    assert len(data["windows"]) > 0


def test_predict_endpoint_invalid_file_type(client):
    files = {"file": ("notes.txt", b"this is not audio", "text/plain")}
    response = client.post("/api/v1/predict", files=files)
    assert response.status_code == 400
    assert "tidak didukung" in response.json()["detail"]


def test_predict_endpoint_empty_file(client):
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = client.post("/api/v1/predict", files=files)
    assert response.status_code == 400
    assert "kosong" in response.json()["detail"]


def test_predict_endpoint_modes_and_fields(client):
    wav_bytes = generate_test_wav_bytes(duration_sec=3.5, sample_rate=16000)
    
    # Test mode consensus
    files = {"file": ("test_modes.wav", wav_bytes, "audio/wav")}
    data_form = {"mode": "consensus"}
    response = client.post("/api/v1/predict", files=files, data=data_form)
    assert response.status_code == 200
    data = response.json()
    assert data["aggregation_mode"] == "consensus"
    assert "abnormal_window_count" in data
    assert "average_abnormal_score" in data
    assert "confidence_category" in data
    assert "is_isolated_spike" in data

    # Test mode maximum
    files = {"file": ("test_modes.wav", wav_bytes, "audio/wav")}
    data_form = {"mode": "maximum"}
    response = client.post("/api/v1/predict", files=files, data=data_form)
    assert response.status_code == 200
    data = response.json()
    assert data["aggregation_mode"] == "maximum"

    # Test mode average
    files = {"file": ("test_modes.wav", wav_bytes, "audio/wav")}
    data_form = {"mode": "average"}
    response = client.post("/api/v1/predict", files=files, data=data_form)
    assert response.status_code == 200
    data = response.json()
    assert data["aggregation_mode"] == "average"


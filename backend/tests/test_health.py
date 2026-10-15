def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert "device" in data
    assert data["class_names"] == ["Normal", "Abnormal"]
    assert data["threshold"] is not None


def test_model_info_endpoint(client):
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["sample_rate"] == 16000
    assert data["window_seconds"] == 2.7
    assert data["overlap"] == 0.5
    assert data["recording_aggregation"] == "maximum"
    assert data["threshold"] > 0.0
    assert data["num_parameters"] > 0
    assert data["model_loaded"] is True

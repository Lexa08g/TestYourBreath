import pytest
import torch
from app.services.model_loader import model_manager
from app.core.config import settings


def test_model_loading_and_weights():
    """
    Memastikan checkpoint ditemukan, dimuat secara penuh dengan strict=True,
    dan semua parameter terkonfirmasi.
    """
    assert settings.CHECKPOINT_FILE.exists(), f"Checkpoint file missing: {settings.CHECKPOINT_FILE}"
    assert settings.CONFIG_FILE.exists(), f"Config file missing: {settings.CONFIG_FILE}"

    if not model_manager.is_loaded:
        model_manager.load_model()

    assert model_manager.is_loaded is True
    assert model_manager.model is not None
    assert model_manager.feature_extractor is not None

    # Check model is in eval mode
    assert not model_manager.model.training

    # Check parameter count > 80 million (standard AST ViT base has ~85M params)
    assert model_manager.num_parameters > 80_000_000

    metadata = model_manager.get_metadata()
    assert metadata["sample_rate"] == 16000
    assert metadata["window_seconds"] == 2.7
    assert metadata["overlap"] == 0.5
    assert metadata["class_names"] == ["Normal", "Abnormal"]
    assert "threshold" in metadata
    assert isinstance(metadata["threshold"], float)
    assert metadata["threshold"] > 0.0

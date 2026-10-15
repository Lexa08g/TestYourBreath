import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.model_loader import model_manager


@pytest.fixture(scope="session", autouse=True)
def ensure_model_loaded():
    """Memastikan model AST dimuat satu kali untuk seluruh sesi pengujian."""
    if not model_manager.is_loaded:
        model_manager.load_model()
    yield


@pytest.fixture
def client():
    """Test client dengan lifespan support."""
    with TestClient(app) as test_client:
        yield test_client

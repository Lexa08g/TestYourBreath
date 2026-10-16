import os
from pathlib import Path
from typing import List
from pydantic import BaseModel

# Project directory paths relative to this file
# backend/app/core/config.py -> backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
BASE_DIR = BACKEND_DIR.parent
MODELS_DIR = BACKEND_DIR / "models" / "ast"

CHECKPOINT_PATH = MODELS_DIR / "pulmosense_v6_ast_window_final.pth"
CONFIG_PATH = MODELS_DIR / "config.json"
PREPROCESSOR_CONFIG_PATH = MODELS_DIR / "preprocessor_config.json"
METADATA_PATH = MODELS_DIR / "model_metadata.json"


class Settings(BaseModel):
    APP_NAME: str = "TestYourBreath API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-Assisted Respiratory Sound Screening Platform Backend"
    
    # Network
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS
    CORS_ORIGINS: List[str] = (
        [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
        if os.getenv("CORS_ORIGINS")
        else [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://localhost",
            "http://127.0.0.1",
            "http://localhost:80",
            "http://127.0.0.1:80",
        ]
    )
    
    # Audio & File validation constraints
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    MIN_AUDIO_DURATION_SECONDS: float = 0.5
    MAX_AUDIO_DURATION_SECONDS: float = 120.0  # 2 minutes max
    
    # Audio processing defaults (will be verified/overridden by model metadata)
    DEFAULT_SAMPLE_RATE: int = 16000
    DEFAULT_WINDOW_SECONDS: float = 2.7
    DEFAULT_OVERLAP: float = 0.5
    DEFAULT_NUM_MEL_BINS: int = 128
    DEFAULT_MAX_LENGTH: int = 1024
    
    # Model storage paths
    CHECKPOINT_FILE: Path = CHECKPOINT_PATH
    CONFIG_FILE: Path = CONFIG_PATH
    PREPROCESSOR_FILE: Path = PREPROCESSOR_CONFIG_PATH
    METADATA_FILE: Path = METADATA_PATH


settings = Settings()

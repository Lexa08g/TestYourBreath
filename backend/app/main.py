import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .services.model_loader import model_manager
from .api import health, predict

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("testyourbreath.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Siklus hidup aplikasi FastAPI:
    Memuat model dan bobot checkpoint satu kali saat startup server.
    """
    logger.info("=== Memulai TestYourBreath Backend ===")
    try:
        model_manager.load_model()
        logger.info("Model AST berhasil dimuat dan siap melayani permintaan.")
    except Exception as e:
        logger.error(f"FATAL: Gagal memuat model AST saat startup: {e}", exc_info=True)
    yield
    logger.info("=== Menghentikan TestYourBreath Backend ===")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, prefix="/api/v1", tags=["Kesehatan & Info Model"])
app.include_router(predict.router, prefix="/api/v1", tags=["Inferensi"])


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Terjadi kesalahan internal yang tidak terduga pada server."}
    )

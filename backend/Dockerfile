# syntax=docker/dockerfile:1
FROM python:3.11-slim AS base

# Pasang dependensi sistem untuk decoding audio (libsndfile & ffmpeg) dan healthcheck (curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Salin dan pasang dependensi Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Salin kode sumber aplikasi dan bobot model AST V6
COPY app/ ./app/
COPY models/ ./models/

# Validasi bahwa checkpoint model bukan pointer Git LFS (< 50MB) melainkan file bobot riil (~345MB)
RUN python -c "import os; sz = os.path.getsize('models/ast/pulmosense_v6_ast_window_final.pth'); assert sz > 50*1024*1024, f'ERROR: File bobot model hanya {sz} bytes (terdeteksi pointer Git LFS). Silakan jalankan git lfs pull sebelum menjalankan docker build!'"

# Konfigurasi variabel lingkungan
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HOST=0.0.0.0 \
    PORT=8000

# Port backend FastAPI
EXPOSE 8000

# Health check untuk memastikan endpoint dan bobot model AST telah siap
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Jalankan server FastAPI via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

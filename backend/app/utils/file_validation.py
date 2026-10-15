from fastapi import UploadFile, HTTPException, status
from ..core.config import settings

# Supported audio extensions (WAV, MP3, M4A, AAC, FLAC, OGG)
ALLOWED_EXTENSIONS = {".wav", ".wave", ".mp3", ".m4a", ".aac", ".flac", ".ogg"}


def validate_file_metadata(file: UploadFile) -> str:
    """
    Validasi nama file, ekstensi, dan keberadaan file yang diunggah.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File audio tidak ditemukan. Silakan pilih file rekaman suara pernapasan (.wav, .mp3, .m4a)."
        )
    
    filename = file.filename.strip()
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Format file '{ext}' tidak didukung. "
                "TestYourBreath mendukung format audio WAV (.wav), MP3 (.mp3), dan M4A (.m4a)."
            )
        )
    
    return filename


async def validate_file_content(file: UploadFile) -> bytes:
    """
    Membaca isi file audio, memvalidasi ukuran maksimum dan integritas konten.
    """
    filename = validate_file_metadata(file)
    
    # Read file content safely
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File audio yang diunggah kosong (0 bytes)."
        )
    
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        max_mb = settings.MAX_FILE_SIZE_BYTES / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Ukuran file terlalu besar ({len(content)/(1024*1024):.1f} MB). Batas maksimum adalah {max_mb:.0f} MB."
        )
    
    # Minimum size for any valid audio header (at least 32 bytes)
    if len(content) < 32:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File audio rusak atau terlalu kecil untuk diproses."
        )
    
    return content

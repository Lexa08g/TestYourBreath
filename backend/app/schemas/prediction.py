from typing import List, Optional
from pydantic import BaseModel, Field


class WindowScore(BaseModel):
    window_index: int = Field(..., description="Indeks window audio (0-indexed)")
    start_seconds: float = Field(..., description="Waktu awal window dalam detik")
    end_seconds: float = Field(..., description="Waktu akhir window dalam detik")
    abnormal_model_score: float = Field(..., description="Skor Abnormal keluaran model untuk window ini")
    normal_model_score: float = Field(..., description="Skor Normal keluaran model untuk window ini")


class PredictionResponse(BaseModel):
    recording_id: str = Field(..., description="Identifier unik rekaman (UUID)")
    filename: str = Field(..., description="Nama file audio yang dianalisis")
    duration_seconds: float = Field(..., description="Durasi rekaman dalam detik")
    sample_rate: int = Field(..., description="Sample rate pemrosesan model (16 kHz)")
    num_windows: int = Field(..., description="Jumlah window audio yang dianalisis")
    class_names: List[str] = Field(..., description="Nama kelas target model")
    predicted_label: str = Field(..., description="Klasifikasi akhir model: 'Normal' atau 'Abnormal'")
    threshold: float = Field(..., description="Nilai threshold klasifikasi dari checkpoint")
    aggregation_method: str = Field(..., description="Metode agregasi window (maximum, consensus, atau average)")
    aggregation_mode: str = Field("consensus", description="Mode evaluasi keputusan yang digunakan")
    abnormal_model_score: float = Field(..., description="Skor abnormal hasil agregasi rekaman")
    normal_model_score: float = Field(..., description="Skor normal pelengkap (1 - abnormal_score)")
    abnormal_window_count: int = Field(0, description="Jumlah window yang skornya melampaui ambang batas")
    abnormal_window_ratio: float = Field(0.0, description="Persentase window abnormal terhadap total window (0.0 - 1.0)")
    average_abnormal_score: float = Field(0.0, description="Rata-rata skor abnormal seluruh window rekaman")
    peak_abnormal_score: float = Field(0.0, description="Skor abnormal tertinggi di antara semua window")
    confidence_category: str = Field("Normal", description="Kategori keyakinan klinis / konsistensi sinyal")
    is_isolated_spike: bool = Field(False, description="True jika hanya 1 window tunggal yang melampaui threshold secara marjinal")
    windows: List[WindowScore] = Field(..., description="Rincian hasil setiap window")
    summary_notes: str = Field(..., description="Ringkasan penjelasan hasil analisis dalam bahasa Indonesia")
    disclaimer: str = Field(..., description="Pernyataan batasan medis TestYourBreath")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Status server: 'ok' atau 'error'")
    model_loaded: bool = Field(..., description="Apakah model AST berhasil dimuat")
    model_name: str = Field(..., description="Nama model atau ID checkpoint")
    device: str = Field(..., description="Device eksekusi (cpu atau cuda)")
    threshold: Optional[float] = Field(None, description="Threshold klasifikasi model")
    class_names: Optional[List[str]] = Field(None, description="Nama kelas target model")


class ModelInfoResponse(BaseModel):
    model_id: str
    architectures: List[str]
    sample_rate: int
    window_seconds: float
    overlap: float
    stride_seconds: float
    max_length: int
    num_mel_bins: int
    recording_aggregation: str
    threshold: float
    class_names: List[str]
    device: str
    num_parameters: int
    model_loaded: bool

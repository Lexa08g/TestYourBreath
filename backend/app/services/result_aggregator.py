import uuid
from typing import List, Dict, Any

from ..schemas.prediction import WindowScore, PredictionResponse


MEDICAL_DISCLAIMER = (
    "TestYourBreath adalah prototipe sistem skrining awal berbasis kecerdasan buatan (AST) "
    "dan BUKAN merupakan alat diagnosis medis resmi. Skor yang ditampilkan merepresentasikan "
    "kecocokan pola akustik dengan data pelatihan ICBHI dan bukan probabilitas klinis suatu penyakit. "
    "Label 'Normal' tidak menjamin ketiadaan gangguan kesehatan paru, dan label 'Abnormal' "
    "bukan bukti pasti adanya penyakit. Segala keluhan pernapasan harus dikonsultasikan secara langsung "
    "kepada dokter atau fasilitas kesehatan berwenang."
)


def aggregate_recording_results(
    filename: str,
    duration_seconds: float,
    sample_rate: int,
    windows: List[WindowScore],
    metadata: Dict[str, Any],
    aggregation_mode: str = "consensus"
) -> PredictionResponse:
    """
    Menggabungkan hasil per-window menjadi kesimpulan rekaman suara pernapasan.
    
    Mendukung mode:
    - 'consensus' (Mode Konsensus Robust): Memerlukan konsistensi sinyal (>= 2 window abnormal atau
      >= 25% window), mengabaikan lonjakan marjinal 1 window yang umumnya berasal dari hembusan angin mic HP.
    - 'maximum' (Mode Skor Puncak / Standar V6): 1 window di atas ambang batas = Abnormal.
    - 'average' (Mode Rata-rata): Menggunakan rata-rata skor seluruh window.
    """
    if not windows:
        raise ValueError("Tidak ada window audio yang dihasilkan untuk dianalisis.")

    # Tentukan mode evaluasi: form/query input -> metadata default -> fallback consensus
    mode = (aggregation_mode or metadata.get("recording_aggregation", "maximum")).lower()
    if mode not in ["consensus", "maximum", "average"]:
        mode = "consensus"

    threshold = float(metadata.get("threshold", 0.957912266254425))
    class_names = metadata.get("class_names", ["Normal", "Abnormal"])

    num_windows = len(windows)
    abnormal_windows = [w for w in windows if w.abnormal_model_score >= threshold]
    abnormal_count = len(abnormal_windows)
    abnormal_ratio = round(abnormal_count / num_windows, 4)

    max_score = round(float(max(w.abnormal_model_score for w in windows)), 4)
    avg_score = round(float(sum(w.abnormal_model_score for w in windows) / num_windows), 4)

    # Deteksi fluktuasi terisolasi: hanya 1 window yang melampaui batas dan marginnya tipis (< 2% di atas threshold)
    # serta rata-rata rekaman secara keseluruhan masih berada di bawah threshold.
    is_isolated_spike = bool(
        abnormal_count == 1 
        and num_windows > 1 
        and max_score < round(threshold + 0.02, 4)
        and avg_score < threshold
    )

    # Logika klasifikasi berdasarkan mode
    if mode == "consensus":
        if num_windows == 1:
            if max_score >= threshold:
                predicted_label = "Abnormal"
                confidence_category = "Abnormal (Window Tunggal)"
                abnormal_score = max_score
            else:
                predicted_label = "Normal"
                confidence_category = "Normal"
                abnormal_score = max_score
        else:
            if abnormal_count >= 2 or abnormal_ratio >= 0.25:
                predicted_label = "Abnormal"
                confidence_category = "Abnormal Konsisten"
                abnormal_score = max_score
            elif abnormal_count == 1:
                if is_isolated_spike:
                    # Fluktuasi terisolasi tipis: dialihkan ke Normal dengan penjelasan edukatif
                    predicted_label = "Normal"
                    confidence_category = "Fluktuasi Terisolasi / Rentan Derau"
                    abnormal_score = avg_score
                else:
                    # Lonjakan 1 window sangat tajam (> 2% di atas ambang batas)
                    predicted_label = "Abnormal"
                    confidence_category = "Abnormal Terisolasi Kuat"
                    abnormal_score = max_score
            else:
                predicted_label = "Normal"
                confidence_category = "Normal Konsisten"
                abnormal_score = max_score

    elif mode == "average":
        abnormal_score = avg_score
        if abnormal_score >= threshold:
            predicted_label = "Abnormal"
            confidence_category = "Abnormal Rata-Rata"
        else:
            predicted_label = "Normal"
            confidence_category = "Normal"

    else:  # maximum
        abnormal_score = max_score
        if abnormal_score >= threshold:
            predicted_label = "Abnormal"
            if is_isolated_spike:
                confidence_category = "Borderline Puncak"
            elif abnormal_count == 1:
                confidence_category = "Abnormal Terisolasi"
            else:
                confidence_category = "Abnormal Konsisten"
        else:
            predicted_label = "Normal"
            confidence_category = "Normal"

    abnormal_score = round(float(abnormal_score), 4)
    normal_score = round(1.0 - abnormal_score, 4)

    # Susun ringkasan catatan (summary_notes) berbahasa Indonesia yang edukatif
    if predicted_label == "Normal" and is_isolated_spike:
        summary_notes = (
            f"Klasifikasi model (Mode Konsensus Robust): Normal (dengan Fluktuasi Terisolasi). "
            f"Dari total {num_windows} segmen audio, hanya 1 segmen (#{abnormal_windows[0].window_index + 1}) "
            f"yang menyentuh ambang batas secara marjinal ({max_score:.4f} vs ambang batas {threshold:.4f}), "
            f"sedangkan {round((1.0 - abnormal_ratio) * 100, 1)}% segmen lainnya sepenuhnya normal dengan "
            f"rata-rata skor rekaman {avg_score:.4f}. Pada rekaman mikrofon smartphone, deviasi sesaat ini "
            f"sangat sering dipicu oleh hembusan udara napas langsung atau gesekan fisik, bukan pola abnormalitas klinis."
        )
    elif predicted_label == "Normal":
        summary_notes = (
            f"Klasifikasi model: Normal. Seluruh segmen suara pernapasan ({num_windows} window) "
            f"konsisten berada dalam batas normal dengan skor abnormal puncak {max_score:.4f} dan "
            f"skor rata-rata {avg_score:.4f}, di bawah ambang batas model ({threshold:.4f}). "
            f"Pola akustik selaras dengan karakteristik pernapasan normal pada dataset referensi."
        )
    elif predicted_label == "Abnormal" and is_isolated_spike and mode == "maximum":
        summary_notes = (
            f"Klasifikasi model (Mode Maksimum Standar): Abnormal. Terdeteksi 1 segmen puncak "
            f"(#{abnormal_windows[0].window_index + 1}) dengan skor {max_score:.4f} yang sedikit "
            f"melampaui ambang batas ({threshold:.4f}). Namun {num_windows - 1} dari {num_windows} segmen lainnya "
            f"berada dalam batas normal (rata-rata skor {avg_score:.4f}). Anda dapat mengaktifkan 'Mode Konsensus Robust' "
            f"untuk menyaring letupan sesaat pada rekaman mikrofon ponsel."
        )
    elif predicted_label == "Abnormal" and abnormal_count >= 2:
        summary_notes = (
            f"Klasifikasi model: Abnormal. Terdeteksi {abnormal_count} dari {num_windows} segmen "
            f"({round(abnormal_ratio * 100, 1)}%) yang konsisten melampaui ambang batas model ({threshold:.4f}), "
            f"dengan skor puncak mencapai {max_score:.4f}. Pola akustik menunjukkan deviasi berulang dari "
            f"karakteristik pernapasan normal pada data pelatihan ICBHI."
        )
    else:
        summary_notes = (
            f"Klasifikasi model: Abnormal. Terdeteksi segmen suara pernapasan dengan skor abnormal "
            f"mencapai {abnormal_score:.4f}, yang melampaui ambang batas skrining model ({threshold:.4f}). "
            f"Pola akustik pada segmen ini menunjukkan indikasi suara napas adventif (seperti mengi atau ronki)."
        )

    recording_id = str(uuid.uuid4())

    return PredictionResponse(
        recording_id=recording_id,
        filename=filename,
        duration_seconds=duration_seconds,
        sample_rate=sample_rate,
        num_windows=num_windows,
        class_names=class_names,
        predicted_label=predicted_label,
        threshold=round(threshold, 4),
        aggregation_method=metadata.get("recording_aggregation", "maximum"),
        aggregation_mode=mode,
        abnormal_model_score=abnormal_score,
        normal_model_score=normal_score,
        abnormal_window_count=abnormal_count,
        abnormal_window_ratio=abnormal_ratio,
        average_abnormal_score=avg_score,
        peak_abnormal_score=max_score,
        confidence_category=confidence_category,
        is_isolated_spike=is_isolated_spike,
        windows=windows,
        summary_notes=summary_notes,
        disclaimer=MEDICAL_DISCLAIMER
    )

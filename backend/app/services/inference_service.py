import logging
from typing import List, Dict, Any
import torch

from .model_loader import model_manager
from ..schemas.prediction import WindowScore

logger = logging.getLogger("testyourbreath.inference")


def run_window_inference(windows: List[Dict[str, Any]]) -> List[WindowScore]:
    """
    Menjalankan inferensi model AST untuk setiap window audio yang telah dipotong.
    
    1. Ekstraksi fitur spectrogram via ASTFeatureExtractor
    2. Pemindahan tensor ke device model (CPU/CUDA)
    3. Inferensi dengan torch.inference_mode()
    4. Perhitungan probabilitas softmax
    5. Pemetaan probabilitas berdasarkan urutan class_names aktual
    """
    model = model_manager.get_model()
    feature_extractor = model_manager.get_feature_extractor()
    metadata = model_manager.get_metadata()
    device = model_manager.device
    
    class_names = metadata.get("class_names", ["Normal", "Abnormal"])
    
    # Identifikasi indeks kelas Abnormal & Normal secara dinamis
    try:
        abnormal_idx = class_names.index("Abnormal")
    except ValueError:
        abnormal_idx = 1
    
    try:
        normal_idx = class_names.index("Normal")
    except ValueError:
        normal_idx = 0
        
    sr = int(metadata.get("sample_rate", 16000))
    window_results: List[WindowScore] = []
    
    # Batch processing untuk efisiensi CPU
    BATCH_SIZE = 8
    
    for i in range(0, len(windows), BATCH_SIZE):
        batch = windows[i : i + BATCH_SIZE]
        raw_audios = [w["audio"] for w in batch]
        
        # Ekstraksi fitur
        inputs = feature_extractor(
            raw_audios,
            sampling_rate=sr,
            return_tensors="pt"
        )
        
        input_values = inputs["input_values"].to(device)
        
        with torch.inference_mode():
            outputs = model(input_values=input_values)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1).cpu().numpy()
            
        for b_idx, w_data in enumerate(batch):
            w_probs = probs[b_idx]
            abnormal_score = float(w_probs[abnormal_idx])
            normal_score = float(w_probs[normal_idx])
            
            window_results.append(
                WindowScore(
                    window_index=w_data["window_index"],
                    start_seconds=w_data["start_seconds"],
                    end_seconds=w_data["end_seconds"],
                    abnormal_model_score=round(abnormal_score, 4),
                    normal_model_score=round(normal_score, 4)
                )
            )
            
    return window_results

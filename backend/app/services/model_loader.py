import json
import logging
from typing import Dict, Any, Optional
import torch
from transformers import ASTConfig, ASTForAudioClassification, ASTFeatureExtractor

from ..core.config import settings

logger = logging.getLogger("testyourbreath.model_loader")


class ModelManager:
    """
    Singleton Manager yang bertanggung jawab memuat model AST,
    bobot fine-tuned dari checkpoint .pth, feature extractor, dan metadata terkait.
    """
    _instance: Optional["ModelManager"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[ASTForAudioClassification] = None
        self.feature_extractor: Optional[ASTFeatureExtractor] = None
        self.metadata: Dict[str, Any] = {}
        self.is_loaded: bool = False
        self.num_parameters: int = 0
        self._initialized = True

    def load_model(self) -> None:
        """
        Memuat konfigurasi, checkpoint .pth dengan strict=True, dan feature extractor.
        """
        logger.info("Memulai pemuatan model TestYourBreath AST...")
        checkpoint_path = settings.CHECKPOINT_FILE
        config_path = settings.CONFIG_FILE
        metadata_path = settings.METADATA_FILE
        preprocessor_path = settings.PREPROCESSOR_FILE

        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"File checkpoint model tidak ditemukan di: {checkpoint_path}"
            )

        # Validasi Git LFS pointer: file model asli ~345 MB, sedangkan pointer LFS hanya ~130 byte
        file_size = checkpoint_path.stat().st_size
        if file_size < 1_000_000:
            raise RuntimeError(
                f"File checkpoint di '{checkpoint_path}' hanya berukuran {file_size} bytes. "
                "File ini terdeteksi sebagai pointer Git LFS dan belum mengunduh bobot model riil (~345 MB). "
                "Silakan jalankan perintah 'git lfs pull' pada terminal di root proyek sebelum menjalankan aplikasi."
            )

        if not config_path.exists():
            raise FileNotFoundError(
                f"File konfigurasi model tidak ditemukan di: {config_path}"
            )

        # 1. Baca metadata eksternal jika ada
        loaded_meta = {}
        if metadata_path.exists():
            try:
                with open(metadata_path, "r", encoding="utf-8") as f:
                    loaded_meta = json.load(f)
            except Exception as e:
                logger.warning(f"Gagal membaca model_metadata.json: {e}")

        # 2. Baca config.json
        with open(config_path, "r", encoding="utf-8") as f:
            config_dict = json.load(f)

        ast_config = ASTConfig.from_dict(config_dict)
        self.model = ASTForAudioClassification(ast_config)

        # 3. Muat checkpoint .pth
        logger.info(f"Membaca checkpoint bobot dari: {checkpoint_path}")
        checkpoint = torch.load(
            str(checkpoint_path),
            map_location=self.device,
            weights_only=False
        )

        if not isinstance(checkpoint, dict):
            raise ValueError(
                f"Struktur checkpoint tidak valid: tipe {type(checkpoint)}, diharapkan dictionary."
            )

        # Ambil metadata dari dalam checkpoint jika ada, gabungkan dengan loaded_meta
        for key in [
            "model_id", "sample_rate", "window_seconds", "overlap",
            "max_length", "num_mel_bins", "recording_aggregation",
            "threshold", "class_names"
        ]:
            if key in checkpoint:
                self.metadata[key] = checkpoint[key]
            elif key in loaded_meta:
                self.metadata[key] = loaded_meta[key]

        # Validasi field penting
        if "sample_rate" not in self.metadata:
            self.metadata["sample_rate"] = settings.DEFAULT_SAMPLE_RATE
        if "window_seconds" not in self.metadata:
            self.metadata["window_seconds"] = settings.DEFAULT_WINDOW_SECONDS
        if "overlap" not in self.metadata:
            self.metadata["overlap"] = settings.DEFAULT_OVERLAP
        if "recording_aggregation" not in self.metadata:
            self.metadata["recording_aggregation"] = "maximum"
        if "class_names" not in self.metadata:
            self.metadata["class_names"] = ["Normal", "Abnormal"]
        if "threshold" not in self.metadata:
            raise ValueError("Nilai 'threshold' tidak ditemukan dalam checkpoint maupun model_metadata.json!")

        # Hitung stride dalam detik
        window_sec = float(self.metadata["window_seconds"])
        overlap_ratio = float(self.metadata["overlap"])
        self.metadata["stride_seconds"] = window_sec * (1.0 - overlap_ratio)

        # 4. Muat bobot ke model dengan strict=True
        if "state_dict" not in checkpoint:
            raise KeyError("Kunci 'state_dict' tidak ditemukan di dalam checkpoint model!")

        state_dict = checkpoint["state_dict"]
        
        # Validasi prefix jika ada module. dari DataParallel
        cleaned_state_dict = {}
        for k, v in state_dict.items():
            if k.startswith("module."):
                cleaned_state_dict[k[7:]] = v
            else:
                cleaned_state_dict[k] = v

        try:
            missing_keys, unexpected_keys = self.model.load_state_dict(
                cleaned_state_dict,
                strict=True
            )
            logger.info("Bobot checkpoint berhasil dimuat secara penuh dengan strict=True.")
        except RuntimeError as e:
            logger.error(f"Gagal memuat state_dict dengan strict=True: {e}")
            raise RuntimeError(
                f"Ketidakcocokan parameter arsitektur model dan bobot checkpoint: {e}"
            )

        # 5. Pindahkan model ke device dan set eval
        self.model.to(self.device)
        self.model.eval()

        self.num_parameters = sum(p.numel() for p in self.model.parameters())

        # 6. Muat Feature Extractor
        if preprocessor_path.exists():
            with open(preprocessor_path, "r", encoding="utf-8") as f:
                prep_dict = json.load(f)
            self.feature_extractor = ASTFeatureExtractor.from_dict(prep_dict)
        else:
            self.feature_extractor = ASTFeatureExtractor(
                feature_size=1,
                sampling_rate=int(self.metadata["sample_rate"]),
                num_mel_bins=int(self.metadata.get("num_mel_bins", 128)),
                max_length=int(self.metadata.get("max_length", 1024)),
                do_normalize=True,
                mean=-4.2677393,
                std=4.5689974,
            )

        self.is_loaded = True
        logger.info(
            f"TestYourBreath AST siap di device '{self.device}'. "
            f"Parameter: {self.num_parameters:,}, Threshold: {self.metadata['threshold']:.4f}"
        )

    def get_model(self) -> ASTForAudioClassification:
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model AST belum dimuat atau belum siap.")
        return self.model

    def get_feature_extractor(self) -> ASTFeatureExtractor:
        if not self.is_loaded or self.feature_extractor is None:
            raise RuntimeError("AST Feature Extractor belum dimuat atau belum siap.")
        return self.feature_extractor

    def get_metadata(self) -> Dict[str, Any]:
        return self.metadata


model_manager = ModelManager()

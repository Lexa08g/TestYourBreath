# TestYourBreath — AI-Assisted Respiratory Sound Screening Platform

> **"Memahami Suara Pernapasan, Mendukung Langkah Awal."**

TestYourBreath adalah platform skrining awal berbasis kecerdasan buatan (*Artificial Intelligence*) yang menganalisis rekaman suara pernapasan (auskultasi paru) menggunakan arsitektur **Audio Spectrogram Transformer (AST)** yang di-*fine-tune* pada dataset **ICBHI 2017 Respiratory Sound Database**.

Aplikasi ini dibangun secara menyeluruh mencakup backend FastAPI berkinerja tinggi, pipeline pemrosesan sinyal audio digital, inferensi model deep learning murni tanpa mock data, visualisasi interaktif per-window, serta antarmuka web modern berbahasa Indonesia.

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Proyek](#-struktur-proyek)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Spesifikasi Model & Preprocessing](#-spesifikasi-model--preprocessing)
- [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
  - [1. Backend (FastAPI + PyTorch)](#1-backend-fastapi--pytorch)
  - [2. Frontend (React + Vite + Tailwind CSS)](#2-frontend-react--vite--tailwind-css)
- [Menjalankan Pengujian (Testing)](#-menjalankan-pengujian-testing)
- [Troubleshooting](#-troubleshooting)
- [Batasan Model & Etika AI](#-batasan-model--etika-ai)
- [Pernyataan Batasan Medis (Medical Disclaimer)](#-pernyataan-batasan-medis-medical-disclaimer)

---

## 🌟 Fitur Utama

1. **Inferensi Model Nyata (No Mock / No Dummy)**:
   - Menggunakan bobot checkpoint fine-tuning AST V6 (`pulmosense_v6_ast_window_final.pth`) dengan 86,2 juta parameter yang dimuat dengan verifikasi parameter ketat (`strict=True`).
2. **Pipeline Preprocessing Audio Digital Multi-Format**:
   - Mendukung format audio **WAV**, **MP3**, dan **M4A (AAC)** menggunakan integrasi `SoundFile` dan `PyAV` (FFmpeg decoder).
   - Konversi multi-channel (stereo) ke mono otomatis.
   - Resampling polyphase akurat ke sample rate model 16.000 Hz.
   - Validasi integritas sinyal (penolakan audio rusak, NaN, Infinity, dan keheningan mutlak).
3. **Segmentasi Window 2,7 Detik**:
   - Membagi audio ke dalam window 2,7 detik (43.200 sampel) dengan overlap 50% (stride 1,35 detik = 21.600 sampel) sesuai metodologi pelatihan model V6.
   - Penanganan audio pendek (< 2,7 detik) dengan right zero-padding yang konsisten.
4. **Agregasi Rekaman Maksimum (Maximum Aggregation)**:
   - Mengevaluasi skor abnormalitas per-window dan mengambil skor tertinggi sebagai skor representatif rekaman.
   - Klasifikasi Normal vs Abnormal berdasarkan ambang batas (*threshold*) aktual checkpoint (`0.9579`).
5. **Visualisasi Interaktif Antar-Window**:
   - Timeline diagram batang interaktif untuk setiap segmen window (W1, W2, ...).
   - Pengguna dapat mengeklik segmen untuk memeriksa waktu mulai, waktu selesai, skor abnormal, dan status ambang batas.
6. **Pratinjau Pemutar Audio (Audio Player)**:
   - Pemutar audio terintegrasi dengan gelombang playback, scrub bar, dan pelacak durasi.
   - Dilengkapi fitur pengujian cepat dengan generator contoh audio pernapasan sintetis (WAV).
7. **Pemeriksaan Kesehatan & Kesiapan Runtime**:
   - Endpoint `/api/v1/health` dan `/api/v1/model-info` yang memantau kesiapan model, alokasi memori, dan device eksekusi (CPU/CUDA).
8. **Keamanan & Privasi**:
   - Tidak menyimpan rekaman audio pengguna secara permanen. File dibersihkan dari memori segera setelah inferensi selesai.

---

## 🏛️ Arsitektur Sistem

```mermaid
flowchart TD
    User([Pengguna / Tenaga Medis]) -->|Unggah File WAV| FE[Frontend React + Vite]
    FE -->|Pratinjau Suara| Player[Audio Player Komponen]
    FE -->|POST multipart/form-data| API[FastAPI Endpoint /api/v1/predict]
    
    subgraph BE [Backend Pipeline]
        API --> Val[Validasi Header & Format Magic Bytes WAV]
        Val --> Resamp[Konversi Mono & Polyphase Resample ke 16 kHz]
        Resamp --> Window[Segmentasi Window 2.7s - Overlap 50%]
        Window --> Feat[ASTFeatureExtractor: 128 Mel Bins Spectrogram]
        Feat --> ASTModel[Audio Spectrogram Transformer Model V6]
        ASTModel --> Infer[torch.inference_mode: Softmax Logits]
        Infer --> Agg[Agregasi Maksimum & Thresholding 0.9579]
    end
    
    Agg --> Resp[JSON PredictionResponse]
    Resp --> ResultsPage[Halaman Hasil & Diagram Interaktif Window]
```

---

## 📁 Struktur Proyek

```text
TestYourBreath/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigasi & status indikator AST aktif
│   │   │   ├── Footer.jsx              # Footer, spesifikasi, dan disclaimer
│   │   │   ├── AudioUploader.jsx       # Drag & drop upload & generator audio demo
│   │   │   ├── AudioPlayer.jsx         # Custom audio player dengan visual bar
│   │   │   ├── AudioVisualizer.jsx     # Visualisasi spektrum gelombang pernapasan
│   │   │   ├── AnalysisProgress.jsx    # Status tahapan pemrosesan inferensi
│   │   │   ├── ResultSummary.jsx       # Ringkasan hasil klasifikasi & gauge threshold
│   │   │   ├── WindowResults.jsx       # Visualisasi timeline & tabel interaktif per-window
│   │   │   └── MedicalDisclaimer.jsx   # Banner batasan tanggung jawab medis
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Beranda, penjelasan AST & manfaat
│   │   │   ├── Analyze.jsx             # Halaman skrining audio
│   │   │   ├── Results.jsx             # Halaman laporan hasil inferensi
│   │   │   └── About.jsx               # Dokumentasi model & batasan klinis
│   │   ├── services/
│   │   │   └── api.js                  # Klien API terpusat (fetch API backend)
│   │   ├── App.jsx                     # Router & manajemen state aplikasi
│   │   ├── main.jsx                    # Entry point React
│   │   └── index.css                   # Tailwind CSS v4 & konfigurasi font
│   ├── index.html                      # HTML root dengan Plus Jakarta Sans
│   ├── vite.config.js                  # Konfigurasi Vite & Tailwind v4
│   ├── package.json                    # Dependensi frontend
│   └── .env.example                    # Template variabel environment frontend
│
├── backend/
│   ├── app/
│   │   ├── main.py                     # Entry point FastAPI, CORS, & lifespan loader
│   │   ├── api/
│   │   │   ├── health.py               # Endpoint /health & /model-info
│   │   │   └── predict.py              # Endpoint inferensi suara /predict
│   │   ├── core/
│   │   │   └── config.py               # Konfigurasi sistem & path absolut model
│   │   ├── services/
│   │   │   ├── model_loader.py         # Pemuat model AST & verifikasi bobot ketat
│   │   │   ├── audio_processor.py      # Resampling 16kHz, mono, & windowing 2,7s
│   │   │   ├── inference_service.py    # Ekstraksi fitur mel & forward pass AST
│   │   │   └── result_aggregator.py    # Agregasi maksimum & evaluasi threshold
│   │   ├── schemas/
│   │   │   └── prediction.py           # Skema Pydantic respon & input
│   │   └── utils/
│   │       └── file_validation.py      # Validasi ukuran & magic bytes RIFF/WAVE
│   ├── models/
│   │   └── ast/
│   │       ├── pulmosense_v6_ast_window_final.pth  # Checkpoint bobot AST fine-tuned
│   │       ├── config.json                         # Konfigurasi arsitektur model
│   │       ├── preprocessor_config.json            # Konfigurasi ASTFeatureExtractor
│   │       └── model_metadata.json                 # Metadata threshold & windowing
│   ├── tests/
│   │   ├── conftest.py                 # Fixture pytest untuk inisialisasi model
│   │   ├── test_model_loader.py        # Pengujian pemuatan bobot strict=True
│   │   ├── test_audio_processor.py     # Pengujian resampling & windowing
│   │   ├── test_health.py              # Pengujian endpoint health & model-info
│   │   └── test_prediction.py          # Pengujian inferensi WAV nyata & error handling
│   ├── requirements.txt                # Dependensi Python
│   └── .env.example                    # Template variabel environment backend
│
├── .gitignore                          # Pencegahan commit file bobot besar & audio
└── README.md                           # Dokumentasi komprehensif proyek
```

---

## 💻 Persyaratan Sistem

- **Sistem Operasi**: Windows 10/11, macOS, atau Linux
- **Python**: Versi **3.10** hingga **3.13** (Direkomendasikan Python 3.11 / 3.12 / 3.13)
- **Node.js**: Versi **18+** atau **20+** (Teruji pada Node v24.12.0)
- **RAM**: Minimal 4 GB (Direkomendasikan 8 GB untuk inferensi AST mulus pada CPU)
- **Penyimpanan**: Ruang kosong minimal ~1.5 GB untuk dependensi dan checkpoint bobot

---

## 🔬 Spesifikasi Model & Preprocessing

| Parameter | Nilai / Keterangan |
| :--- | :--- |
| **Arsitektur Dasar** | Audio Spectrogram Transformer (`ASTForAudioClassification`) |
| **Checkpoint Basis** | `MIT/ast-finetuned-audioset-10-10-0.4593` |
| **Fine-Tuning Checkpoint** | `pulmosense_v6_ast_window_final.pth` |
| **Jumlah Parameter** | 86.190.338 parameter |
| **Target Kelas** | `["Normal", "Abnormal"]` |
| **Sampling Rate Target** | 16.000 Hz |
| **Panjang Window** | 2,7 detik (43.200 sampel) |
| **Overlap Window** | 50% (Stride 1,35 detik = 21.600 sampel) |
| **Resolusi Spektrogram** | 128 Mel Bins, frekuensi stride 10, waktu stride 10 |
| **Metode Agregasi Rekaman** | **Maximum Window Score** |
| **Ambang Batas (Threshold)** | **0.957912266254425** |

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

> **Catatan Git LFS (Penting):** Proyek ini menggunakan Git LFS untuk mengelola file bobot model deep learning (`.pth`, ~345 MB). Pastikan Git LFS aktif saat meng-clone repository agar model terunduh penuh:
> ```powershell
> git lfs install
> git clone <URL-REPOSITORY-ANDA>
> # Atau jika file .pth belum terunduh: git lfs pull
> ```

Jalankan perintah berikut melalui terminal (PowerShell di Windows atau terminal VS Code):

### 1. Backend (FastAPI + PyTorch)

Buka terminal pertama di direktori root `TestYourBreath`:

```powershell
# Masuk ke direktori backend
cd backend

# Buat virtual environment Python (opsional namun sangat disarankan)
python -m venv .venv

# Aktifkan virtual environment di Windows PowerShell
.\.venv\Scripts\Activate.ps1

# Jika terjadi restriction script execution di PowerShell, jalankan:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Pasang dependensi yang sesuai
pip install -r requirements.txt

# Jalankan server backend FastAPI dengan Uvicorn
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> Backend akan berjalan di `http://127.0.0.1:8000`. Dokumentasi interaktif Swagger API tersedia di `http://127.0.0.1:8000/docs`.

---

### 2. Frontend (React + Vite + Tailwind CSS)

Buka terminal kedua di direktori root `TestYourBreath`:

```powershell
# Masuk ke direktori frontend
cd frontend

# Pasang dependensi Node.js
npm install

# Jalankan server development Vite
npm run dev
```

> Buka peramban (*browser*) Anda pada tautan: **`http://127.0.0.1:5173/`**.

---

## 🧪 Menjalankan Pengujian (Testing)

Test suite backend memverifikasi seluruh komponen utama (model loader, audio preprocessing, endpoint API, dan pipeline inferensi):

```powershell
cd backend
python -m pytest tests -v
```

Hasil pengujian otomatis memvalidasi 12 skenario pengujian:
- `test_convert_to_mono`: Konversi audio multi-channel ke mono.
- `test_resample_audio`: Resampling polyphase ke 16 kHz.
- `test_slice_into_windows_standard`: Segmentasi window 2,7s dengan overlap 50%.
- `test_slice_into_windows_short_audio_padding`: Right zero-padding untuk audio pendek.
- `test_validate_and_clean_audio_silence`: Penolakan audio hening (amplitudo nol).
- `test_validate_and_clean_audio_nan`: Penolakan nilai sinyal tidak valid (NaN / Inf).
- `test_health_endpoint`: Pemeriksaan status server dan kesiapan model.
- `test_model_info_endpoint`: Validasi metadata runtime model AST.
- `test_model_loading_and_weights`: Verifikasi pemuatan bobot checkpoint dengan `strict=True`.
- `test_predict_endpoint_valid_audio`: Inferensi ujung-ke-ujung menggunakan file WAV nyata.
- `test_predict_endpoint_invalid_file_type`: Penolakan format file non-WAV.
- `test_predict_endpoint_empty_file`: Penolakan file kosong (0 bytes).

---

## 🔧 Troubleshooting

1. **`RuntimeError: Error(s) in loading state_dict for ASTForAudioClassification`**:
   - Penyebab: Menggunakan `transformers >= 5.x` di mana Hugging Face mengubah penamaan layer AST dari `audio_spectrogram_transformer.encoder.layer.X` menjadi `audio_spectrogram_transformer.layers.X`.
   - Solusi: Pastikan versi transformers yang terpasang adalah `transformers==4.57.6`:
     ```powershell
     pip install "transformers==4.57.6"
     ```

2. **`ModuleNotFoundError: No module named 'soundfile'`**:
   - Solusi: Pasang soundfile melalui pip:
     ```powershell
     pip install soundfile
     ```

3. **Status di Navbar Menunjukkan "Backend Offline"**:
   - Pastikan backend FastAPI sedang berjalan di `http://127.0.0.1:8000`.
   - Periksa file `frontend/.env` dan pastikan nilainya `VITE_API_BASE_URL=http://127.0.0.1:8000`.

4. **Error Resampling / Memory Terlalu Besar**:
   - TestYourBreath membatasi durasi file audio hingga maksimal 120 detik (2 menit) untuk mencegah kehabisan memori RAM saat segmentasi window.

---

## ⚖️ Batasan Model & Etika AI

Model klasifikasi suara pernapasan TestYourBreath memiliki batasan teknis penting yang perlu dipahami:

1. **Domain Shift & Variasi Akustik**:
   - Model dilatih menggunakan dataset ICBHI 2017 yang direkam menggunakan stetoskop akustik/digital tertentu pada lingkungan klinis terkontrol.
   - Rekaman yang diambil dari mikrofon ponsel cerdas, mikrofon headset berkabel/nirkabel, atau ruangan dengan gema tinggi dapat memengaruhi distribusi frekuensi dan skor prediksi model.
2. **Karakteristik Klasifikasi Biner**:
   - Model hanya mengklasifikasikan pola sinyal suara menjadi **Normal** atau **Abnormal**.
   - Model **tidak mendiagnosis** jenis penyakit tertentu seperti pneumonia, asma, PPOK, tuberkulosis, atau bronkitis secara spesifik.
3. **Probabilitas Tidak Terkalibrasi**:
   - Skor model (0.00 – 1.00) merupakan luaran fungsi aktivasi softmax terhadap data latih, bukan nilai probabilitas klinis bahwa seorang pasien mengidap penyakit paru.

---

## ⚕️ Pernyataan Batasan Medis (Medical Disclaimer)

> **PENTING UNTUK DIKETAHUI:**
> 
> TestYourBreath adalah **prototipe sistem skrining awal eksperimental** berbasis kecerdasan buatan dan **BUKAN** merupakan perangkat diagnosis medis resmi, alat pengganti stetoskop dokter, maupun pengganti penilaian klinis profesional kesehatan.
> 
> - Label **Normal** tidak menjamin bahwa seseorang terbebas dari gangguan sistem pernapasan.
> - Label **Abnormal** bukan merupakan bukti mutlak bahwa seseorang menderita penyakit tertentu.
> - Hasil analisis dari platform ini **tidak boleh dijadikan dasar pengambilan keputusan medis**, terapi, perubahan dosis obat, atau pengobatan mandiri.
> 
> Jika Anda atau keluarga mengalami keluhan respirasi seperti sesak napas, nyeri dada, batuk berkepanjangan, mengi, atau demam tinggi, **segera konsultasikan kondisi Anda dengan dokter spesialis paru atau fasilitas pelayanan kesehatan berwenang**.

---

*Dikembangkan dengan dedikasi untuk eksplorasi teknologi AI dalam bidang kesehatan akustik respirasi.*

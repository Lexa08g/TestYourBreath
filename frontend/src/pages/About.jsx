import React, { useState, useEffect } from 'react';
import { 
  Cpu, Waves, Database, AlertTriangle, ShieldCheck, 
  HelpCircle, CheckCircle2, ArrowRight, ExternalLink 
} from 'lucide-react';
import { getModelInfo } from '../services/api';

export default function About({ setActivePage }) {
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    getModelInfo()
      .then((data) => setModelInfo(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 md:py-10">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Metodologi & Arsitektur
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tentang TestYourBreath & Model AST
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Eksplorasi mendalam mengenai teknologi Audio Spectrogram Transformer, dataset pelatihan ICBHI 2017, dan batas pertanggungjawaban dalam skrining akustik respirasi.
        </p>
      </div>

      {/* 1. What is TestYourBreath */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Apa itu TestYourBreath?
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          TestYourBreath adalah sebuah platform perangkat lunak prototipe yang memanfaatkan arsitektur deep learning mutakhir untuk menganalisis karakteristik gelombang suara pernapasan. Tujuan utamanya adalah sebagai <strong>alat skrining awal</strong> yang membantu mendeteksi adanya anomali atau deviasi pola suara napas dibandingkan dengan pola pernapasan normal.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Sistem ini memproses rekaman suara napas secara otomatis tanpa perlu rekayasa fitur manual yang rentan bias.
        </p>
      </section>

      {/* 2. Audio Spectrogram Transformer (AST) Architecture */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Audio Spectrogram Transformer (AST)
            </h2>
            <p className="text-xs text-slate-500">Mekanisme Self-Attention Tanpa Lapisan Konvolusi (Convolution-Free)</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          AST adalah arsitektur yang mengadaptasi Vision Transformer (ViT) langsung pada domain audio. Sinyal suara 1D mula-mula diubah menjadi representasi waktu-frekuensi 2D (log-mel filterbank). Spektrogram ini kemudian dipecah menjadi patch-patch kecil (ukuran 16×16) yang dihubungkan dengan embedding posisi (positional embeddings), lalu diproses melalui serangkaian lapisan multi-head self-attention.
        </p>

        {/* Runtime Model Metadata Card */}
        {modelInfo && (
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-teal-400 font-bold font-sans">Konfigurasi Model Aktif (Runtime):</span>
              <span className="text-[10px] text-slate-400">Device: {modelInfo.device.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div>&bull; Checkpoint: {modelInfo.model_id}</div>
              <div>&bull; Total Parameter: {(modelInfo.num_parameters / 1_000_000).toFixed(1)} Juta</div>
              <div>&bull; Durasi Window: {modelInfo.window_seconds} detik</div>
              <div>&bull; Overlap Window: {(modelInfo.overlap * 100).toFixed(0)}% (Stride: {modelInfo.stride_seconds}s)</div>
              <div>&bull; Resolusi Spektrogram: {modelInfo.num_mel_bins} Mel Bins</div>
              <div>&bull; Ambang Batas (Threshold): {modelInfo.threshold.toFixed(4)}</div>
              <div>&bull; Metode Agregasi: {modelInfo.recording_aggregation}</div>
              <div>&bull; Target Kelas: {modelInfo.class_names.join(', ')}</div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Research Dataset (ICBHI 2017) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Dataset Riset ICBHI 2017
            </h2>
            <p className="text-xs text-slate-500">Respiratory Sound Database Challenge</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Model fine-tuned TestYourBreath dilatih menggunakan <strong>ICBHI 2017 Respiratory Sound Database</strong>, salah satu repositori benchmarking suara pernapasan internasional yang paling diakui. Dataset ini mencakup 920 rekaman audio dari 126 subjek pasien dengan beragam kondisi, termasuk suara napas adventisius seperti crackles (ronki basah) dan wheezes (mengi).
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <p className="font-semibold text-slate-800">Keterbukaan Metrik Riset:</p>
          <p className="leading-relaxed">
            Metrik evaluasi yang diperoleh pada pemisahan dataset pelatihan internal merefleksikan performa model pada kondisi rekaman ICBHI. Angka akurasi pada dataset penelitian <em>bukan merupakan bukti validasi klinis independen</em> pada berbagai populasi atau tipe mikrofon komersial di luar dataset tersebut.
          </p>
        </div>
      </section>

      {/* 4. Model Classification vs Clinical Diagnosis */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Perbedaan Klasifikasi Model & Diagnosis Medis
            </h2>
            <p className="text-xs text-slate-500">Prinsip Batasan Klinis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900">Klasifikasi Model (TestYourBreath)</h4>
            <p className="leading-relaxed text-xs">
              Mengevaluasi kesamaan pola frekuensi spektrogram audio dengan data latih. Menghasilkan skor statistik antara 0 hingga 1 dan membandingkannya dengan ambang batas (threshold).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
            <h4 className="font-bold text-teal-900">Diagnosis Klinis Medis</h4>
            <p className="leading-relaxed text-xs text-teal-950">
              Ditegakkan oleh dokter berlisensi melalui anamnesis riwayat gejala, pemeriksaan fisik menyeluruh, spirometri, laboratorium darah, dan radiologi (rontgen toraks/CT scan).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

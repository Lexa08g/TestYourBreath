import React from 'react';
import { 
  ArrowLeft, RefreshCw, Download, FileText, 
  Activity, Clock, Layers, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import ResultSummary from '../components/ResultSummary';
import WindowResults from '../components/WindowResults';
import AudioPlayer from '../components/AudioPlayer';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Results({ result, audioFile, onReset }) {
  if (!result) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-slate-600">Belum ada hasil analisis yang tersedia.</p>
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm"
        >
          Ke Halaman Analisis
        </button>
      </div>
    );
  }

  const handleDownloadReport = () => {
    const reportData = {
      platform: "TestYourBreath AI Respiratory Screening",
      timestamp: new Date().toISOString(),
      result: result,
      disclaimer: "Hasil skrining awal non-medis. Bukan merupakan diagnosis resmi."
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TestYourBreath_Report_${result.recording_id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 md:py-10">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Analisis</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laporan Hasil Skrining Akustik
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            ID Rekaman: {result.recording_id} &bull; File: {result.filename}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh JSON</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Analisis Rekaman Lain</span>
          </button>
        </div>
      </div>

      {/* 1. Classification Result Summary Card */}
      <ResultSummary result={result} />

      {/* 2. Audio Player Preview */}
      {audioFile && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900">
            Dengarkan Kembali Rekaman yang Dianalisis
          </h4>
          <AudioPlayer audioFile={audioFile} />
        </div>
      )}

      {/* 3. Detailed Per-Window Breakdown & Visualization */}
      <WindowResults windows={result.windows} threshold={result.threshold} />

      {/* 4. Technical Audit & Process Overview */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Ringkasan Teknis Inferensi:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
          <div>&bull; Model: Audio Spectrogram Transformer (AST V6)</div>
          <div>&bull; Filter Audio: Butterworth Bandpass (50 - 2500 Hz)</div>
          <div>&bull; Sample Rate: {result.sample_rate} Hz (Resampled Polyphase)</div>
          <div>&bull; Durasi Total: {result.duration_seconds} detik ({result.num_windows} window)</div>
          <div>&bull; Ambang Batas Klasifikasi: {result.threshold.toFixed(4)}</div>
          <div>&bull; Skor Puncak / Rata-Rata: {(result.peak_abnormal_score || result.abnormal_model_score).toFixed(4)} / {(result.average_abnormal_score || 0).toFixed(4)}</div>
        </div>
      </div>

      {/* 5. Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}

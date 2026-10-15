import React, { useState } from 'react';
import { 
  ArrowLeft, RefreshCw, Download, 
  Activity, ChevronDown, Volume2, ShieldCheck
} from 'lucide-react';
import ResultSummary from '../components/ResultSummary';
import WindowResults from '../components/WindowResults';
import AudioPlayer from '../components/AudioPlayer';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Results({ result, audioFile, onReset }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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
            Hasil Skrining Suara Pernapasan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            File Audio: <strong className="text-slate-700">{result.filename}</strong> &bull; Durasi: {result.duration_seconds} detik
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh Laporan</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Skrining Rekaman Lain</span>
          </button>
        </div>
      </div>

      {/* 1. Classification Result Summary Card (Minimalist & To the Point) */}
      <ResultSummary result={result} />

      {/* 2. Audio Player Preview */}
      {audioFile && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Dengarkan Kembali Rekaman yang Dianalisis
            </h4>
          </div>
          <AudioPlayer audioFile={audioFile} />
        </div>
      )}

      {/* 3. Optional Technical Details (Collapsible for Medical / Research Use) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/70 select-none transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Rincian Teknis Analisis &amp; Grafik Window
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Opsional / Tenaga Medis
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Diagram visualisasi window 2,7 detik, frekuensi audio, dan metrik mentah model AST.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 shrink-0 ml-2">
            <span>{showTechnicalDetails ? 'Sembunyikan' : 'Buka Rincian'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-5 sm:p-7 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-6">
            {/* Detailed Per-Window Breakdown & Visualization */}
            <WindowResults windows={result.windows} threshold={result.threshold} />

            {/* Technical Audit & Process Overview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Parameter &amp; Spesifikasi Inferensi:</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                <div>&bull; ID Rekaman: {result.recording_id}</div>
                <div>&bull; Model: Audio Spectrogram Transformer (AST V6)</div>
                <div>&bull; Filter Audio: Butterworth Bandpass (50 - 2500 Hz)</div>
                <div>&bull; Sample Rate: {result.sample_rate} Hz (Resampled Polyphase)</div>
                <div>&bull; Durasi Total: {result.duration_seconds} detik ({result.num_windows} window)</div>
                <div>&bull; Ambang Batas Klasifikasi: {result.threshold.toFixed(4)}</div>
                <div>&bull; Skor Puncak / Rata-Rata: {(result.peak_abnormal_score || result.abnormal_model_score).toFixed(4)} / {(result.average_abnormal_score || 0).toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}

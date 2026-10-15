import React, { useState } from 'react';
import { 
  ArrowRight, AlertCircle, 
  Activity, HelpCircle, ShieldCheck
} from 'lucide-react';
import AudioUploader from '../components/AudioUploader';
import AudioPlayer from '../components/AudioPlayer';
import AnalysisProgress from '../components/AnalysisProgress';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import { analyzeAudio } from '../services/api';

export default function Analyze({ onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mode tetap: Konsensus Robust — mode terbaik untuk rekaman mic HP
  const ANALYSIS_MODE = 'consensus';

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setErrorMessage('');
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setErrorMessage('');
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage('Silakan pilih atau unggah file rekaman suara pernapasan (.wav, .mp3, .m4a) terlebih dahulu.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      // Panggil backend API dengan mode Konsensus Robust (default terbaik)
      const result = await analyzeAudio(selectedFile, ANALYSIS_MODE);
      // Callback ke parent untuk berpindah ke halaman Hasil
      onAnalysisComplete(result, selectedFile);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses audio pada server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 md:py-10">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>Skrining Suara Pernapasan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Analisis Rekaman Suara Pernapasan
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Unggah rekaman auskultasi atau suara pernapasan (.WAV, .MP3, .M4A) untuk dievaluasi oleh model Audio Spectrogram Transformer (AST).
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Loading state vs Upload/Preview state */}
        {isAnalyzing ? (
          <AnalysisProgress />
        ) : (
          <div className="space-y-6">
            {/* Step 1: Upload or Choose File */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                1. Pilih atau Tarik File Audio (.WAV, .MP3, .M4A)
              </label>
              <AudioUploader
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
              />
            </div>

            {/* Step 2: Audio Player Preview */}
            {selectedFile && (
              <div className="space-y-2 pt-2">
                <label className="block text-sm font-bold text-slate-900">
                  2. Pratinjau Suara Sebelum Analisis
                </label>
                <AudioPlayer audioFile={selectedFile} />
              </div>
            )}

            {/* Model Info Badge — menampilkan mode yang digunakan */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-50/60 border border-teal-200/80">
              <ShieldCheck className="w-4.5 h-4.5 text-teal-600 shrink-0" />
              <div className="text-xs text-teal-900">
                <span className="font-bold">Mode Analisis: Konsensus Robust</span>
                <span className="text-teal-700 ml-1">— Akurat &amp; toleran derau mikrofon HP. Mengabaikan lonjakan marjinal sesaat.</span>
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Analisis Tidak Dapat Dilanjutkan</p>
                  <p className="text-xs text-rose-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Trigger Inference Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!selectedFile || isAnalyzing}
                onClick={handleStartAnalysis}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md ${
                  !selectedFile || isAnalyzing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg active:scale-[0.99]'
                }`}
              >
                <span>Mulai Analisis Model AST</span>
                <ArrowRight className="w-5 h-5 text-teal-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guidelines Box */}
      <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>Panduan Rekaman Audio untuk Hasil Optimal:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
          <li>Gunakan rekaman dengan durasi minimal 2,7 detik (rekomendasi 5 hingga 15 detik).</li>
          <li>Pastikan mikrofon atau stetoskop digital ditempatkan stabil pada dinding dada/trakea tanpa gesekan pakaian.</li>
          <li>Lakukan rekaman di ruangan yang tenang dengan meminimalkan suara percakapan latar.</li>
        </ul>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer compact={true} />
    </div>
  );
}

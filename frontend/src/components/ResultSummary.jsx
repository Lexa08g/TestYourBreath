import React from 'react';
import { 
  CheckCircle2, AlertTriangle, Info, Clock, Layers, 
  Gauge, BarChart, ShieldCheck, Zap, Sparkles
} from 'lucide-react';

export default function ResultSummary({ result }) {
  if (!result) return null;

  const threshold = result.threshold || 0.9579;
  const windows = result.windows || [];
  const numWindows = result.num_windows || windows.length || 1;

  // Nilai metrik dasar dari windows
  const abnormalWindows = windows.filter(w => w.abnormal_model_score >= threshold);
  const abnormalCount = result.abnormal_window_count !== undefined 
    ? result.abnormal_window_count 
    : abnormalWindows.length;
  const abnormalRatio = result.abnormal_window_ratio !== undefined 
    ? result.abnormal_window_ratio 
    : (abnormalCount / (numWindows || 1));
  const peakScore = result.peak_abnormal_score !== undefined 
    ? result.peak_abnormal_score 
    : (windows.length ? Math.max(...windows.map(w => w.abnormal_model_score)) : result.abnormal_model_score);
  const avgScore = result.average_abnormal_score !== undefined 
    ? result.average_abnormal_score 
    : (windows.length ? windows.reduce((sum, w) => sum + w.abnormal_model_score, 0) / windows.length : result.abnormal_model_score);
  
  const isIsolatedSpike = result.is_isolated_spike !== undefined 
    ? result.is_isolated_spike 
    : (abnormalCount === 1 && numWindows > 1 && peakScore < (threshold + 0.02) && avgScore < threshold);

  // Evaluasi tetap menggunakan mode Konsensus Robust
  let currentLabel = 'Normal';
  let currentScore = peakScore;
  let currentCategory = 'Normal';
  let currentNotes = '';

  if (numWindows === 1) {
    currentLabel = peakScore >= threshold ? 'Abnormal' : 'Normal';
    currentScore = peakScore;
    currentCategory = peakScore >= threshold ? 'Abnormal (Window Tunggal)' : 'Normal';
  } else {
    if (abnormalCount >= 2 || abnormalRatio >= 0.25) {
      currentLabel = 'Abnormal';
      currentScore = peakScore;
      currentCategory = 'Abnormal Konsisten';
    } else if (abnormalCount === 1) {
      if (isIsolatedSpike) {
        currentLabel = 'Normal';
        currentScore = avgScore;
        currentCategory = 'Fluktuasi Terisolasi / Rentan Derau';
      } else {
        currentLabel = 'Abnormal';
        currentScore = peakScore;
        currentCategory = 'Abnormal Terisolasi Kuat';
      }
    } else {
      currentLabel = 'Normal';
      currentScore = peakScore;
      currentCategory = 'Normal Konsisten';
    }
  }

  if (currentLabel === 'Normal' && isIsolatedSpike) {
    currentNotes = `Klasifikasi: Normal (dengan Fluktuasi Terisolasi). Hanya 1 dari ${numWindows} segmen audio yang menyentuh ambang batas secara marjinal (${peakScore.toFixed(4)} vs ambang ${threshold.toFixed(4)}), sedangkan ${((1.0 - abnormalRatio) * 100).toFixed(1)}% segmen lainnya berada di zona normal dengan skor rata-rata rekaman ${avgScore.toFixed(4)}. Pada mikrofon HP tanpa stetoskop, letupan sesaat ini umumnya bersumber dari turbulensi udara napas atau gesekan fisik, bukan pola abnormalitas klinis konsisten.`;
  } else if (currentLabel === 'Normal') {
    currentNotes = `Klasifikasi: Normal. Seluruh ${numWindows} segmen audio konsisten berada dalam rentang normal dengan skor puncak ${peakScore.toFixed(4)} dan rata-rata ${avgScore.toFixed(4)}, di bawah ambang batas skrining (${threshold.toFixed(4)}).`;
  } else if (abnormalCount >= 2) {
    currentNotes = `Klasifikasi: Abnormal. Terdeteksi ${abnormalCount} dari ${numWindows} segmen (${(abnormalRatio * 100).toFixed(1)}%) yang konsisten melampaui ambang batas model (${threshold.toFixed(4)}), dengan skor puncak ${peakScore.toFixed(4)}.`;
  } else {
    currentNotes = `Klasifikasi: Abnormal. Terdeteksi segmen pernapasan dengan deviasi akustik tajam (${peakScore.toFixed(4)}) yang melampaui batas toleransi derau.`;
  }

  const isAbnormal = currentLabel === 'Abnormal';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Mode Badge — informational, no selection */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <span className="text-xs font-bold text-teal-800">Mode Evaluasi: Konsensus Robust</span>
        <span className="text-xs text-slate-500">— Akurat &amp; toleran derau mikrofon HP</span>
      </div>

      {/* Classification Outcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Hasil Skrining
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
              {currentCategory}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isAbnormal ? 'Klasifikasi: Abnormal' : 'Klasifikasi: Normal'}
            </h2>
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isAbnormal
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {currentLabel}
            </span>
          </div>
        </div>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
            isAbnormal
              ? 'bg-amber-100/80 text-amber-700'
              : 'bg-emerald-100/80 text-emerald-700'
          }`}
        >
          {isAbnormal ? (
            <AlertTriangle className="w-7 h-7" />
          ) : (
            <CheckCircle2 className="w-7 h-7" />
          )}
        </div>
      </div>

      {/* Special Callout: Isolated Spike / Noise Warning */}
      {isIsolatedSpike && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Penyesuaian Akustik: Fluktuasi Derau Terisolasi Terdeteksi</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Hanya <strong>1 dari {numWindows} segmen</strong> yang menyentuh ambang batas secara marjinal ({peakScore.toFixed(4)} vs ambang batas {threshold.toFixed(4)}), sedangkan <strong>{((1.0 - abnormalRatio) * 100).toFixed(0)}% segmen lainnya berada di zona normal</strong>. 
            Pada mikrofon smartphone atau rekaman non-stetoskop, lonjakan tunggal sesaat seperti ini umumnya disebabkan oleh letupan hembusan udara (breath puff), desah napas tajam, atau gesekan fisik mikrofon, bukan kelainan paru konsisten.
          </p>
        </div>
      )}

      {/* Summary Note */}
      <div
        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
          isAbnormal
            ? 'bg-amber-50/50 border-amber-200/80 text-amber-950'
            : 'bg-teal-50/50 border-teal-200/80 text-teal-950'
        }`}
      >
        <p className="font-medium">{currentNotes}</p>
        <p className="text-xs text-slate-500 mt-2">
          *Catatan: Skor keluaran model merepresentasikan kecocokan pola akustik dengan data referensi ICBHI dan bukan diagnosis penyakit tertentu.
        </p>
      </div>

      {/* Score Comparison Gauge against Checkpoint Threshold */}
      <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-teal-600" />
            <span>Skor Evaluasi (Konsensus) vs Ambang Batas</span>
          </span>
          <span className="font-mono text-slate-500">
            Skor: <strong className="text-slate-900">{currentScore.toFixed(4)}</strong> / Ambang Batas: {threshold.toFixed(4)}
          </span>
        </div>

        {/* Progress bar with threshold marker */}
        <div className="relative pt-2 pb-1">
          <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
            {/* Model abnormal score fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAbnormal
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                  : 'bg-gradient-to-r from-teal-400 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, currentScore * 100))}%` }}
            />
          </div>

          {/* Threshold marker position */}
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
            style={{ left: `${Math.min(98, Math.max(2, threshold * 100))}%` }}
          >
            <div className="w-0.5 h-6 bg-slate-900 shadow-xs" />
            <span className="text-[10px] font-mono font-bold text-slate-700 -mt-0.5">
              Ambang ({threshold.toFixed(2)})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>0.00 (Normal Murni)</span>
          <span className="text-slate-400 font-mono text-[10px]">
            Puncak: {peakScore.toFixed(4)} &bull; Rata-Rata: {avgScore.toFixed(4)}
          </span>
          <span>1.00 (Abnormal Kuat)</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Durasi Rekaman
          </span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {result.duration_seconds}s
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Segmen Terindikasi
          </span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {abnormalCount} / {numWindows} <span className="text-xs text-slate-500 font-normal">({(abnormalRatio * 100).toFixed(0)}%)</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <BarChart className="w-3.5 h-3.5 text-slate-500" />
            Rata-Rata Skor
          </span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {avgScore.toFixed(4)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-slate-500" />
            Skor Puncak Window
          </span>
          <p className="text-base font-bold text-slate-900 font-mono">
            {peakScore.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}


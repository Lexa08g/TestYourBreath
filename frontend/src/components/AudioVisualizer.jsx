import React from 'react';
import { Waves, Activity } from 'lucide-react';

export default function AudioVisualizer({ isAnalyzing = false, title = "Visualisasi Spektrogram & Gelombang Akustik" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 border border-slate-800 p-6 text-white shadow-xl">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">{title}</h4>
            <p className="text-[11px] text-slate-400">Transformasi Time-Domain ke Frekuensi Mel-Spectrogram (128 Mel Bins)</p>
          </div>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Memproses Sinyal...</span>
          </div>
        )}
      </div>

      {/* Spectrogram / Waveform Bar Grid Simulation */}
      <div className="h-32 sm:h-40 flex items-end justify-between gap-1 sm:gap-1.5 px-2 py-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
        {Array.from({ length: 48 }).map((_, i) => {
          // Calculate stylized biological respiratory sound peaks (inspirasi & ekspirasi)
          const baseHeight = Math.sin((i / 48) * Math.PI * 2) * 40 + 50;
          const harmonic = Math.cos((i / 48) * Math.PI * 6) * 15;
          const height = Math.min(95, Math.max(15, baseHeight + harmonic));

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${
                  isAnalyzing
                    ? 'bg-gradient-to-t from-teal-500 via-sky-400 to-indigo-300'
                    : i % 4 === 0
                    ? 'bg-gradient-to-t from-teal-600 to-teal-400'
                    : 'bg-gradient-to-t from-slate-700 to-slate-500'
                }`}
                style={{
                  height: isAnalyzing
                    ? `${Math.max(10, (Math.sin(i * 0.5 + Date.now() * 0.003) * 0.5 + 0.5) * 90)}%`
                    : `${height}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Axis notes */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
        <span>0.0s (Inspirasi)</span>
        <span className="text-slate-400 flex items-center gap-1 font-sans">
          <Activity className="w-3 h-3 text-teal-400" />
          <span>Frekuensi Sampling: 16.000 Hz</span>
        </span>
        <span>2.7s (Ekspirasi - Window AST)</span>
      </div>
    </div>
  );
}

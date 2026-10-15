import React, { useState } from 'react';
import { Layers, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function WindowResults({ windows = [], threshold = 0.9579 }) {
  const [selectedWindowIdx, setSelectedWindowIdx] = useState(0);

  if (!windows || windows.length === 0) return null;

  const activeWindow = windows[selectedWindowIdx] || windows[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>Rincian Analisis Per-Window (Segmen 2,7 Detik)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap window berdurasi 2,7 detik dengan pergeseran (stride) 1,35 detik (overlap 50%).
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total: <strong className="text-slate-800">{windows.length}</strong> window
        </div>
      </div>

      {/* Interactive Window Bar Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">Diagram Skor Abnormalitas Antar-Window:</span>
          <span className="text-[11px] text-slate-400 font-mono">
            Garis Putus-Putus: Ambang Batas ({threshold.toFixed(2)})
          </span>
        </div>

        {/* Visual Timeline Bars */}
        <div className="relative pt-6 pb-2 px-2 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          {/* Threshold reference line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400 z-10 pointer-events-none"
            style={{ bottom: `${Math.min(95, Math.max(10, threshold * 100))}%` }}
          >
            <span className="absolute right-2 -top-4 text-[9px] font-mono font-bold text-rose-600 bg-white px-1.5 py-0.5 rounded shadow-2xs">
              Threshold {threshold.toFixed(2)}
            </span>
          </div>

          <div className="h-36 sm:h-44 flex items-end justify-between gap-1.5 sm:gap-2">
            {windows.map((w, idx) => {
              const isSelected = selectedWindowIdx === idx;
              const isAboveThreshold = w.abnormal_model_score >= threshold;
              const barHeight = Math.min(100, Math.max(8, w.abnormal_model_score * 100));

              return (
                <div
                  key={w.window_index}
                  onClick={() => setSelectedWindowIdx(idx)}
                  className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
                >
                  {/* Tooltip on hover/selected */}
                  <div
                    className={`transition-all duration-200 text-center mb-1 ${
                      isSelected ? 'opacity-100 scale-105' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-slate-900 text-white shadow-xs">
                      {w.abnormal_model_score.toFixed(2)}
                    </span>
                  </div>

                  {/* The bar element */}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-200 ${
                      isSelected
                        ? isAboveThreshold
                          ? 'bg-rose-600 ring-2 ring-rose-400'
                          : 'bg-teal-600 ring-2 ring-teal-400'
                        : isAboveThreshold
                        ? 'bg-rose-400 hover:bg-rose-500'
                        : 'bg-teal-400 hover:bg-teal-500'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />

                  {/* Window label */}
                  <span className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                    W{w.window_index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Window Detail Card */}
      {activeWindow && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-xs font-mono font-bold">
                Window #{activeWindow.window_index + 1}
              </span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Rentang Waktu: {activeWindow.start_seconds.toFixed(1)}s - {activeWindow.end_seconds.toFixed(1)}s
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {activeWindow.abnormal_model_score >= threshold
                ? 'Segmen ini memiliki skor di atas threshold (karakteristik akustik abnormal terdeteksi).'
                : 'Segmen ini berada di bawah threshold (konsisten dengan pola pernapasan normal).'}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Skor Abnormal</span>
              <span
                className={`text-base font-bold ${
                  activeWindow.abnormal_model_score >= threshold
                    ? 'text-rose-600'
                    : 'text-teal-600'
                }`}
              >
                {activeWindow.abnormal_model_score.toFixed(4)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Skor Normal</span>
              <span className="text-base font-bold text-slate-700">
                {activeWindow.normal_model_score.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Window List Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Segmen (Window)</th>
              <th className="py-2.5 px-4">Waktu Mulai</th>
              <th className="py-2.5 px-4">Waktu Selesai</th>
              <th className="py-2.5 px-4 font-mono">Skor Abnormal</th>
              <th className="py-2.5 px-4 font-mono">Skor Normal</th>
              <th className="py-2.5 px-4">Status Ambang Batas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
            {windows.map((w, idx) => {
              const isAbove = w.abnormal_model_score >= threshold;
              const isSelected = selectedWindowIdx === idx;

              return (
                <tr
                  key={w.window_index}
                  onClick={() => setSelectedWindowIdx(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50/60 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2 px-4 font-sans font-medium text-slate-900">
                    Window #{w.window_index + 1}
                  </td>
                  <td className="py-2 px-4">{w.start_seconds.toFixed(1)}s</td>
                  <td className="py-2 px-4">{w.end_seconds.toFixed(1)}s</td>
                  <td className={`py-2 px-4 ${isAbove ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                    {w.abnormal_model_score.toFixed(4)}
                  </td>
                  <td className="py-2 px-4 text-slate-600">{w.normal_model_score.toFixed(4)}</td>
                  <td className="py-2 px-4 font-sans">
                    {isAbove ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-500" /> Melampaui Threshold
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        <CheckCircle className="w-3 h-3 text-teal-500" /> Di Bawah Threshold
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

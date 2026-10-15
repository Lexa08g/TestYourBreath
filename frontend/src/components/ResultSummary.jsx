import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Stethoscope, HeartPulse, 
  ShieldCheck, HelpCircle, Activity, ChevronDown, 
  PhoneCall, AlertOctagon, Check
} from 'lucide-react';

export default function ResultSummary({ result }) {
  const [showScoreDetail, setShowScoreDetail] = useState(false);

  if (!result) return null;

  const threshold = result.threshold || 0.9579;
  const windows = result.windows || [];
  const numWindows = result.num_windows || windows.length || 1;

  // Nilai metrik dasar
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

  // Evaluasi Konsensus
  let isAbnormal = false;
  if (numWindows === 1) {
    isAbnormal = peakScore >= threshold;
  } else {
    if (abnormalCount >= 2 || abnormalRatio >= 0.25) {
      isAbnormal = true;
    } else if (abnormalCount === 1) {
      isAbnormal = !isIsolatedSpike;
    } else {
      isAbnormal = false;
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Main Outcome Card */}
      <div 
        className={`rounded-3xl border p-6 sm:p-8 transition-all duration-200 ${
          isAbnormal
            ? 'bg-gradient-to-br from-amber-50/90 via-white to-rose-50/60 border-amber-200/90 shadow-sm'
            : 'bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 border-teal-200/90 shadow-sm'
        }`}
      >
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs bg-white">
              {isAbnormal ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-800">Perlu Pemeriksaan Lanjutan</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-800">Hasil Skrining Bersih</span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isAbnormal ? 'Pola Suara Napas: Terindikasi Tidak Biasa' : 'Pola Suara Napas: Normal'}
            </h2>

            <p className="text-sm text-slate-600 max-w-xl">
              {isAbnormal 
                ? 'Model kecerdasan buatan mendeteksi karakteristik suara pernapasan tambahan yang tidak umum ditemukan pada napas sehat.'
                : isIsolatedSpike
                ? 'Secara keseluruhan suara pernapasan Anda normal dan bersih, dengan sedikit suara hembusan mikrofon sesaat yang tidak berbahaya.'
                : 'Suara pernapasan Anda terdengar teratur, bersih, dan tidak ditemukan tanda bunyi napas tambahan.'
              }
            </p>
          </div>

          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isAbnormal
                ? 'bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-emerald-600 text-white shadow-emerald-600/20'
            }`}
          >
            {isAbnormal ? (
              <AlertTriangle className="w-8 h-8" />
            ) : (
              <CheckCircle2 className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* 2. Content Breakdown: Reason if Normal, Guidance if Abnormal */}
        <div className="pt-6">
          {!isAbnormal ? (
            /* KONDISI NORMAL: Alasan Kenapa Dinyatakan Normal */
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Alasan Mengapa Dinyatakan Normal:</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-2xs space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Aliran Napas Lancar</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Siklus menarik dan membuang napas stabil tanpa penyempitan saluran udara.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-2xs space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Bebas Bunyi Tambahan</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tidak ditemukan bunyi mengi/ngik-ngik (wheezing) atau suara gemeretak basah (crackles).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-2xs space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Karakteristik Akustik Baik</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Frekuensi suara pernapasan konsisten berada pada spektrum paru yang sehat.
                  </p>
                </div>
              </div>

              {/* Tips Sehat */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs sm:text-sm flex items-start gap-3">
                <HeartPulse className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Saran Menjaga Kesehatan Paru:</p>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Pertahankan kesehatan sistem pernapasan Anda dengan berolahraga teratur, minum air putih cukup, dan menghindari paparan asap rokok atau polusi udara. Jika di kemudian hari timbul keluhan batuk atau sesak, periksakan ke dokter.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* KONDISI ABNORMAL: Petunjuk & Langkah Selanjutnya */
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-amber-600" />
                  <span>Petunjuk &amp; Langkah Lebih Lanjut:</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Skrining awal ini bukan diagnosis penyakit. Lakukan langkah-langkah berikut untuk memastikan kondisi pernapasan Anda:
                </p>
              </div>

              {/* 3 Action Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Periksa ke Dokter</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Kunjungi puskesmas, klinik, atau dokter spesialis paru untuk pemeriksaan stetoskop (auskultasi fisik) secara langsung.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Pantau Gejala</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Catat apakah ada sesak napas, bunyi napas 'ngik-ngik', batuk berdahak, demam, atau rasa berat di dada saat beraktivitas.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Tindakan Mandiri</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Duduk tegak santai, hindari berbaring jika sesak, jauhi asap rokok dan debu. Gunakan obat yang pernah diresepkan dokter jika ada.
                  </p>
                </div>
              </div>

              {/* Red Flag Warning Box */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs sm:text-sm flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-900">Kapan Harus Segera ke IGD Rumah Sakit?</p>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Segera cari bantuan medis darurat jika mengalami: napas tersengal-sengal parah, kesulitan berbicara lebih dari beberapa kata, bibir atau ujung jari membiru, atau nyeri dada yang menusuk.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Simple Visual Meter (Human Friendly) */}
        <div className="mt-6 pt-5 border-t border-slate-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Indikator Tingkat Risiko Suara:</span>
            <span className={`font-bold ${isAbnormal ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isAbnormal ? 'Terindikasi Pola Tambahan' : 'Zona Aman (Normal)'}
            </span>
          </div>

          {/* Clean Visual Bar */}
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5 flex">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isAbnormal 
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500' 
                  : 'bg-gradient-to-r from-teal-400 to-emerald-500'
              }`}
              style={{ width: isAbnormal ? '85%' : '20%' }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>🟢 Bersih (Normal)</span>
            <span>🟡 Perlu Konfirmasi Medis</span>
            <span>🔴 Indikasi Kuat</span>
          </div>
        </div>

        {/* Optional Toggle for Technical Metrics */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowScoreDetail(!showScoreDetail)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>{showScoreDetail ? 'Sembunyikan Angka Metrik' : 'Tampilkan Angka Metrik AI'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showScoreDetail ? 'rotate-180' : ''}`} />
          </button>
          <span className="text-[11px] text-slate-400">
            Durasi rekaman: {result.duration_seconds} detik
          </span>
        </div>

        {/* Technical Score Sub-panel (hidden by default) */}
        {showScoreDetail && (
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Skor Abnormal Tertinggi:</span>
              <strong className="text-slate-900">{peakScore.toFixed(4)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Ambang Batas Model:</span>
              <strong className="text-slate-900">{threshold.toFixed(4)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Segmen Terdampak:</span>
              <strong className="text-slate-900">{abnormalCount} dari {numWindows} window</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

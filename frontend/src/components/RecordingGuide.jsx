import React, { useState } from 'react';
import { 
  HelpCircle, ChevronDown, ChevronUp, CheckCircle2, 
  XCircle, Radio, Sparkles, X, ZoomIn, ShieldAlert 
} from 'lucide-react';

import step1Img from '../assets/1_temukan_area_trakea.png';
import step2Img from '../assets/2_posisi_yang_benar.png';
import step3Img from '../assets/3_posisi_yang_kurang_tepat.png';
import step4Img from '../assets/04_lakukan_perekaman.png';

const STEPS_DATA = [
  {
    id: 1,
    title: '1. Temukan Area Trakea',
    badge: 'Langkah 1: Identifikasi Titik',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    image: step1Img,
    alt: 'Ilustrasi menemukan area trakea pada leher depan',
    summary: 'Raba lembut bagian tengah leher depan di bawah jakun hingga lekukan atas tulang dada.',
    details: [
      'Gunakan jari telunjuk untuk meraba bagian tengah leher depan.',
      'Titik ideal berada tepat di bawah jakun (laryngeal prominence) hingga di atas lekukan tulang dada (suprasternal notch).',
      'Area trakea ini menghasilkan suara pernapasan (stridor, wheezing, napas bronkial) paling kuat dan minim redaman lemak/otot.'
    ]
  },
  {
    id: 2,
    title: '2. Posisikan Mikrofon dengan Benar',
    badge: 'Langkah 2: Posisi Tepat',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBadge: CheckCircle2,
    iconColor: 'text-emerald-600',
    image: step2Img,
    alt: 'Ilustrasi posisi ponsel yang benar di leher depan',
    summary: 'Tempelkan lubang mikrofon smartphone dengan lembut dan stabil tepat di titik trakea.',
    details: [
      'Arahkan lubang mikrofon smartphone (biasanya di sisi bawah atau atas) langsung ke area trakea.',
      'Pegang ponsel dengan stabil dan sentuhkan secara lembut tanpa menekan leher terlalu kuat.',
      'Pastikan jari tangan memegang tepi ponsel dan TIDAK menutupi lubang mikrofon.'
    ]
  },
  {
    id: 3,
    title: '3. Hindari 3 Posisi yang Kurang Tepat',
    badge: 'Perhatikan: Jangan Lakukan',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBadge: XCircle,
    iconColor: 'text-rose-600',
    image: step3Img,
    alt: 'Ilustrasi tiga posisi perekaman yang salah',
    summary: 'Hindari sisi samping leher, bawah dagu, atau terlalu jauh/rendah di dada.',
    details: [
      'Kiri (❌): Menempel di samping leher — suara napas teredam otot tebal dan terganggu getaran denyut nadi.',
      'Tengah (❌): Terlalu tinggi di bawah dagu — jauh dari trakea, lebih banyak menangkap resonansi rongga mulut.',
      'Kanan (❌): Terlalu rendah atau menjauh di dada — suara napas terlalu tipis/faint dan tertutup suara sekitar.'
    ]
  },
  {
    id: 4,
    title: '4. Lakukan Perekaman Suara',
    badge: 'Langkah 3: Eksekusi Rekam',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBadge: Radio,
    iconColor: 'text-teal-600',
    image: step4Img,
    alt: 'Ilustrasi melakukan perekaman napas dalam dengan hening',
    summary: 'Duduk rileks dengan kepala sedikit menengadah di ruangan hening. Rekam napas dalam selama 5–10 detik.',
    details: [
      'Pastikan ruangan tenang dan hening (hindari suara kipas angin kencang, TV, atau orang berbicara).',
      'Duduk tegak, rileks, dan angkat sedikit dagu/kepala agar saluran trakea terbuka leluasa.',
      'Bernapaslah dalam dan teratur melalui mulut/hidung selama 5–10 detik (minimal 2–3 siklus napas utuh).',
      'Hindari berbicara, menelan ludah, atau menggeser jari di ponsel selama proses perekaman.'
    ]
  }
];

export default function RecordingGuide({ defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeModalImg, setActiveModalImg] = useState(null);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200">
      {/* Header bar with toggle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 select-none transition-colors border-b border-slate-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Panduan Langkah Perekaman Audio di Leher (Trakea)
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                4 Panduan Visual
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ikuti posisi mikrofon HP yang benar untuk hasil skrining model AST yang optimal dan akurat.
            </p>
          </div>
        </div>

        <button 
          type="button" 
          aria-label={isExpanded ? 'Tutup panduan' : 'Buka panduan'}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-2"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-5 sm:p-7 space-y-6 bg-slate-50/40">
          {/* Quick Notice Banner */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-900 text-xs">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-semibold">Tips Kualitas Sinyal:</strong> Suara pernapasan yang terekam pada trakea memiliki kejernihan akustik tinggi. Pastikan mikrofon menyentuh lembut kulit leher tanpa gesekan kain pakaian.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {STEPS_DATA.map((step) => {
              const IconComponent = step.iconBadge;
              return (
                <div 
                  key={step.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Step Image with Zoom Trigger */}
                  <div 
                    onClick={() => setActiveModalImg(step)}
                    className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center border-b border-slate-100"
                    title="Klik untuk memperbesar gambar"
                  >
                    <img 
                      src={step.image} 
                      alt={step.alt}
                      className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Hover Zoom overlay button */}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-semibold shadow-md backdrop-blur-xs">
                        <ZoomIn className="w-3.5 h-3.5 text-teal-600" />
                        Perbesar Ilustrasi
                      </span>
                    </div>

                    {/* Step Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-xs backdrop-blur-xs bg-white/90 ${step.badgeColor}`}>
                        {IconComponent && <IconComponent className={`w-3.5 h-3.5 ${step.iconColor}`} />}
                        <span>{step.badge}</span>
                      </span>
                    </div>
                  </div>

                  {/* Step Text Details */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {step.summary}
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-1 text-slate-600 text-[11px] sm:text-xs">
                      {step.details.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-teal-600 font-bold shrink-0 mt-0.5">&bull;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Checklist Footer inside Guide */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>Durasi Minimal:</strong> Rekam 5–10 detik (format .WAV, .MP3, atau .M4A) untuk akurasi analisis per-window 2,7 detik model AST.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline shrink-0"
            >
              Tutup Panduan ▲
            </button>
          </div>
        </div>
      )}

      {/* Modal View for zoomed image */}
      {activeModalImg && (
        <div 
          onClick={() => setActiveModalImg(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border mb-1 ${activeModalImg.badgeColor}`}>
                  {activeModalImg.badge}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {activeModalImg.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalImg(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img 
                src={activeModalImg.image} 
                alt={activeModalImg.alt} 
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="p-4 sm:p-5 space-y-2 text-xs text-slate-600 bg-white">
              <p className="font-semibold text-slate-900">{activeModalImg.summary}</p>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                {activeModalImg.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

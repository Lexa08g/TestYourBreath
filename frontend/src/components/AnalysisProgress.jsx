import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Waves, Cpu, BarChart2 } from 'lucide-react';

export default function AnalysisProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Validasi & Dekode Audio', desc: 'Membaca byte WAV, memeriksa integritas & amplitudo' },
    { title: 'Konversi Mono & Resampling 16 kHz', desc: 'Polyphase resampling ke sample rate model AST' },
    { title: 'Segmentasi Window 2,7 Detik', desc: 'Memotong audio menjadi window tumpang-tindih 50%' },
    { title: 'Ekstraksi Fitur Spektrogram Mel', desc: 'Menghitung 128 Mel bins frekuensi untuk AST' },
    { title: 'Inferensi Model AST & Agregasi', desc: 'Forward pass ViT transformer & evaluasi threshold' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Sedang Menganalisis Suara Pernapasan...
          </h3>
          <p className="text-xs text-slate-500">
            Model Audio Spectrogram Transformer sedang mengevaluasi pola akustik rekaman. Mohon tunggu sejenak.
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 pt-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? 'bg-teal-50/70 border border-teal-200'
                  : isDone
                  ? 'bg-slate-50 border border-slate-100 opacity-80'
                  : 'opacity-40'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <div className="space-y-0.5 text-xs">
                <p className={`font-semibold ${isCurrent ? 'text-teal-900' : 'text-slate-800'}`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

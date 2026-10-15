import React from 'react';
import { 
  ArrowRight, Activity, Waves, Cpu, ShieldCheck, 
  CheckCircle2, AlertCircle, FileAudio, Sparkles, Stethoscope 
} from 'lucide-react';
import AudioVisualizer from '../components/AudioVisualizer';
import MedicalDisclaimer from '../components/MedicalDisclaimer';

export default function Home({ setActivePage }) {
  return (
    <div className="space-y-16 md:space-y-24 py-6 md:py-12">
      {/* Hero Section */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Teknologi Audio Spectrogram Transformer (AST V6)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Memahami Suara Pernapasan,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
                Mendukung Langkah Awal.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Platform skrining awal bertenaga AI yang mengevaluasi pola akustik rekaman pernapasan untuk membantu mengidentifikasi karakteristik suara normal dan abnormal secara transparan dan terstandarisasi.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => setActivePage('analyze')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>Mulai Skrining Audio</span>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActivePage('about')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm shadow-xs transition-colors"
              >
                <span>Pelajari Model AST</span>
              </button>
            </div>

            {/* Key feature bullets */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Segmentasi Window 2,7 Detik</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Agregasi Rekaman Maksimum</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Dataset ICBHI 2017</span>
              </div>
            </div>
          </div>

          {/* Right Column: Audio Waveform Visualizer */}
          <div className="lg:col-span-5">
            <AudioVisualizer isAnalyzing={false} />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
            Alur Pemrosesan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana TestYourBreath Bekerja
          </h2>
          <p className="text-sm text-slate-600">
            Pipeline inferensi terstruktur yang mengubah sinyal akustik pernapasan menjadi klasifikasi pola yang objektif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-extrabold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Input & Resampling</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pengguna mengunggah file rekaman pernapasan berformat WAV. Backend mengonversi saluran stereo menjadi mono dan melakukan resampling polyphase ke 16.000 Hz.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-extrabold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Windowing 2,7 Detik</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Audio dibagi menjadi segmen-segmen berdurasi 2,7 detik (43.200 sampel) dengan overlap 50%. Fitur Mel-spektrogram (128 bin) diekstraksi untuk setiap window.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Inferensi & Agregasi</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Model AST mengevaluasi setiap segmen. Hasil keseluruhan ditentukan melalui agregasi maksimum terhadap threshold checkpoint model (0.9579).
            </p>
          </div>
        </div>
      </section>

      {/* Technology AST Section */}
      <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Arsitektur Transformer
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Audio Spectrogram Transformer (AST)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Berbeda dengan CNN konvensional yang memproses fitur spasial lokal secara terpisah, AST mengadopsi mekanisme self-attention penuh dari Vision Transformer (ViT). Model ini mampu menangkap korelasi temporal dan harmonik jangka panjang pada spektrogram suara pernapasan.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Checkpoint Asal</span>
                <span className="font-semibold text-white">MIT AudioSet AST</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Fine-Tuning</span>
                <span className="font-semibold text-white">ICBHI 2017 Respiratory</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 text-xs">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Spesifikasi Pipeline Inferensi V6</span>
            </h4>
            <div className="space-y-2 text-slate-300 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Panjang Window:</span>
                <span className="text-teal-400">2.7 detik (43.200 sampel)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Stride (Overlap 50%):</span>
                <span className="text-teal-400">1.35 detik (21.600 sampel)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Dimensi Mel Bins:</span>
                <span className="text-teal-400">128 Bins &bull; Max Length 1024</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Ambang Batas (Threshold):</span>
                <span className="text-teal-400 font-bold">0.9579</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Agregasi Rekaman:</span>
                <span className="text-teal-400 font-bold">Maximum</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits and Limitations Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Manfaat dan Batasan Sistem
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Keterbukaan mengenai kapabilitas dan batas wewenang teknis TestYourBreath.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-teal-50/50 border border-teal-200/80 space-y-3">
            <h4 className="text-base font-bold text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>Manfaat Skrining Awal</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-teal-950/80 list-disc list-inside">
              <li>Mendeteksi indikasi ketidakteraturan akustik secara objektif dan cepat.</li>
              <li>Memberikan visualisasi rincian window demi window untuk melihat segmen anomali.</li>
              <li>Mendukung dokumentasi rekaman suara pernapasan untuk bahan konsultasi ke dokter.</li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <h4 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Batasan & Kehati-hatian</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-amber-950/80 list-disc list-inside">
              <li>Kualitas rekaman mikrofon ponsel atau noise ruangan dapat memengaruhi akurasi skor.</li>
              <li>Model mengklasifikasikan pola Normal vs Abnormal, bukan jenis penyakit spesifik.</li>
              <li>Bukan alat uji klinis independen; tidak boleh dijadikan dasar pengobatan mandiri.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Medical Disclaimer Banner */}
      <MedicalDisclaimer />
    </div>
  );
}

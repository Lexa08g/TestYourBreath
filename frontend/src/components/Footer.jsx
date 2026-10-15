import React from 'react';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand and Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                TestYour<span className="text-teal-400">Breath</span>
              </span>
            </div>
            <p className="text-slate-300 font-medium text-base">
              "Memahami Suara Pernapasan, Mendukung Langkah Awal."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Platform skrining awal berbasis kecerdasan buatan untuk analisis pola suara pernapasan menggunakan model Audio Spectrogram Transformer (AST) yang di-fine-tune pada dataset ICBHI 2017.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-semibold text-white text-xs uppercase tracking-wider">
              Navigasi
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => setActivePage('analyze')}
                  className="hover:text-white transition-colors"
                >
                  Analisis Suara Pernapasan
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div className="space-y-3">
            <h5 className="font-semibold text-white text-xs uppercase tracking-wider">
              Spesifikasi Sistem
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Arsitektur: <span className="text-slate-200">AST (ViT-Base 16x16)</span></li>
              <li>Windowing: <span className="text-slate-200">2.7 Detik (Overlap 50%)</span></li>
              <li>Sampling Rate: <span className="text-slate-200">16.000 Hz</span></li>
              <li>Agregasi: <span className="text-slate-200">Maximum Window</span></li>
              <li>Dataset: <span className="text-slate-200">ICBHI 2017 Challenge</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} TestYourBreath. Dikembangkan untuk keperluan skrining awal respirasi.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Sistem prototipe skrining awal &bull; Bukan pengganti diagnosis medis</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

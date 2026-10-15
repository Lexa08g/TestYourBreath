import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Bukan Diagnosis Medis: </span>
          TestYourBreath adalah prototipe penelitian skrining awal berbasis pola suara (AST). Hasil klasifikasi wajib dikonfirmasikan dengan pemeriksaan klinis oleh dokter spesialis.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/60 border border-amber-200 rounded-2xl p-5 md:p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 shadow-xs">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-sm text-slate-700">
          <h4 className="font-semibold text-slate-900 text-base">
            Pernyataan Batasan & Tanggung Jawab Medis (Medical Disclaimer)
          </h4>
          <p className="leading-relaxed">
            TestYourBreath dikembangkan sebagai <strong>prototipe skrining awal berbasis kecerdasan buatan</strong> (Audio Spectrogram Transformer) menggunakan dataset penelitian ICBHI 2017 Respiratory Sound Database.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li>
              <strong>Bukan Pengganti Dokter:</strong> Sistem ini tidak dirancang untuk menggantikan diagnosis dokter, stetoskop akustik medis, atau pemeriksaan radiologi (rontgen/CT-scan).
            </li>
            <li>
              <strong>Arti Label:</strong> Label <em>Normal</em> tidak menjamin ketiadaan penyakit paru-paru, dan label <em>Abnormal</em> bukan bukti mutlak adanya diagnosis penyakit tertentu.
            </li>
            <li>
              <strong>Tindakan Lanjut:</strong> Jika Anda mengalami sesak napas, batuk kronis, nyeri dada, atau keluhan respirasi lainnya, segera kunjungi dokter atau fasilitas pelayanan kesehatan terdekat.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

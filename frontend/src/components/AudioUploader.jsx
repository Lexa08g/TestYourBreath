import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Trash2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function AudioUploader({ selectedFile, onFileSelect, onFileRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const validateAndSet = (file) => {
    setErrorMsg('');
    if (!file) return;

    const name = file.name.toLowerCase();
    const validExts = ['.wav', '.wave', '.mp3', '.m4a', '.aac', '.flac', '.ogg'];
    if (!validExts.some((ext) => name.endsWith(ext))) {
      setErrorMsg('Format file tidak didukung. Harap pilih file audio berformat .wav, .mp3, atau .m4a.');
      return;
    }

    // Max 25MB
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Ukuran file melebihi batas 25 MB. Harap gunakan rekaman yang lebih ringkas.');
      return;
    }

    if (file.size === 0) {
      setErrorMsg('File audio yang dipilih kosong (0 byte).');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSet(e.target.files[0]);
    }
  };

  /**
   * Fitur Demo Cepat: Menghasilkan contoh file audio pernapasan sintetis (WAV)
   * secara langsung di browser untuk kemudahan pengujian lokal.
   */
  const handleGenerateSampleAudio = () => {
    try {
      const sampleRate = 16000;
      const durationSeconds = 5.4; // 2 windows exact
      const numSamples = Math.floor(sampleRate * durationSeconds);
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      // RIFF identifier
      view.setUint32(0, 0x52494646, false); // "RIFF"
      view.setUint32(4, 36 + numSamples * 2, true);
      view.setUint32(8, 0x57415645, false); // "WAVE"
      view.setUint32(12, 0x666d7420, false); // "fmt "
      view.setUint32(16, 16, true); // Subchunk1Size
      view.setUint16(20, 1, true); // PCM format
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true); // BlockAlign
      view.setUint16(34, 16, true); // BitsPerSample
      view.setUint32(36, 0x64617461, false); // "data"
      view.setUint32(40, numSamples * 2, true);

      // Synthesize respiratory wheeze & breath pattern
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // Respiratory cycle (envelope ~ 0.3 Hz)
        const envelope = Math.sin(Math.PI * (t % 2.7) / 2.7);
        // Base breath sound (noise + low tone)
        const noise = (Math.random() * 2 - 1) * 0.15;
        const breathTone = Math.sin(2 * Math.PI * 180 * t) * 0.25;
        // Subtle wheeze harmonic
        const wheezeTone = Math.sin(2 * Math.PI * 400 * t) * 0.15;
        const sample = Math.max(-1, Math.min(1, (breathTone + wheezeTone + noise) * envelope));
        view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      }

      const sampleBlob = new Blob([buffer], { type: 'audio/wav' });
      const sampleFile = new File([sampleBlob], 'sample_respiratory_cycle_16k.wav', {
        type: 'audio/wav',
        lastModified: Date.now(),
      });

      validateAndSet(sampleFile);
    } catch (err) {
      setErrorMsg('Gagal membuat contoh audio: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
              isDragging
                ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 bg-white/70 hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.m4a,.aac,.flac,.ogg,audio/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">
                  Tarik & Lepaskan File Audio di Sini
                </p>
                <p className="text-xs text-slate-500">
                  atau <span className="text-teal-600 font-semibold underline underline-offset-2">pilih file dari perangkat</span>
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-medium">Format: .WAV, .MP3, .M4A</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-medium">Batas: 25 MB</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-medium">Durasi: 0.5s - 120s</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Sample Action */}
          <div className="mt-3 flex items-center justify-between p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Tidak memiliki rekaman suara pernapasan?</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateSampleAudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-teal-500 text-slate-800 hover:text-teal-700 font-semibold shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gunakan Contoh WAV (5.4s)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB &bull; Format: {selectedFile.name.split('.').pop().toUpperCase()} Audio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Ganti File
              </button>
              <button
                type="button"
                onClick={onFileRemove}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Hapus file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

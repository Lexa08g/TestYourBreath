const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Memeriksa status kesehatan backend dan status kesiapan model AST.
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server merespons dengan status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Tidak dapat terhubung ke server backend TestYourBreath. Pastikan backend FastAPI sedang berjalan di port 8000.'
      );
    }
    throw error;
  }
}

/**
 * Mengambil informasi konfigurasi dan metadata model AST.
 */
export async function getModelInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/model-info`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Gagal mengambil info model (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Koneksi ke backend terputus saat mengambil informasi model.');
    }
    throw error;
  }
}

/**
 * Mengirim file audio pernapasan ke backend untuk inferensi model AST.
 * @param {File} audioFile
 * @param {string} mode - 'consensus' | 'maximum' | 'average'
 */
export async function analyzeAudio(audioFile, mode = 'consensus') {
  if (!audioFile) {
    throw new Error('File audio belum dipilih.');
  }

  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('mode', mode);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error(
          data.detail || 'Ukuran file audio terlalu besar. Batas maksimal yang diizinkan adalah 25 MB.'
        );
      }
      if (response.status === 400 || response.status === 422) {
        throw new Error(
          data.detail || 'Format file audio tidak valid. Harap gunakan rekaman berformat WAV, MP3, atau M4A.'
        );
      }
      if (response.status === 503) {
        throw new Error(
          data.detail || 'Model AST belum siap di server backend. Silakan tunggu beberapa detik.'
        );
      }
      throw new Error(data.detail || `Analisis gagal dengan kode status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Koneksi backend terputus atau backend belum aktif di http://127.0.0.1:8000.'
      );
    }
    throw error;
  }
}

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music } from 'lucide-react';

export default function AudioPlayer({ audioFile, audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    let url = '';
    if (audioUrl) {
      url = audioUrl;
      setObjectUrl(url);
    } else if (audioFile) {
      url = URL.createObjectURL(audioFile);
      setObjectUrl(url);
    }

    return () => {
      if (url && !audioUrl) {
        URL.revokeObjectURL(url);
      }
    };
  }, [audioFile, audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800">
      <audio
        ref={audioRef}
        src={objectUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Play/Pause Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-teal-500/20 active:scale-95"
            aria-label={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            title="Mulai Ulang"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar and Waveform representation */}
        <div className="flex-1 w-full space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span className="text-slate-500 flex items-center gap-1.5 font-sans">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Pratinjau Suara Pernapasan</span>
            </span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="relative flex items-center">
            {/* Custom styled range slider */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.01"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
            />
          </div>

          {/* Decorative subtle sound bars reflecting playback */}
          <div className="flex items-center justify-between gap-1 h-3 pt-1 px-1 opacity-70">
            {Array.from({ length: 32 }).map((_, i) => {
              const active = (i / 32) * 100 <= progressPercent;
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    active ? 'bg-teal-400' : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying
                      ? `${Math.max(20, Math.sin(i * 0.8 + currentTime * 5) * 50 + 50)}%`
                      : `${((i * 13) % 40) + 20}%`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

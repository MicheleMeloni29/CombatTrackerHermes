"use client";

import { useState, useRef, useEffect } from "react";

interface Track {
  title: string;
  artist: string;
  src: string;
}

const PLAYLIST: Track[] = [
  { title: "Steel Against Granite", artist: "D&D Ambience", src: "/music/Steel_Against_Granite.mp3.mpeg" },
  { title: "The King's Last Gambit", artist: "D&D Ambience", src: "/music/The_King_s_Last_Gambit.mp3.mpeg" },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasTracks = PLAYLIST.length > 0;
  const currentTrack = PLAYLIST[currentTrackIndex] ?? null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => setIsPlaying((v) => !v);

  const nextTrack = () => {
    if (!hasTracks) return;
    setCurrentTrackIndex((i) => (i + 1) % PLAYLIST.length);
  };

  const prevTrack = () => {
    if (!hasTracks) return;
    setCurrentTrackIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  return (
    <div className="bg-background/80 border border-gold-dim/30 rounded-lg p-4 space-y-3 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🎵</span>
        <h3 className="text-gold font-medieval text-sm tracking-wide uppercase">
          Music Player
        </h3>
      </div>

      {/* Decorative divider */}
      <div className="ornament-divider">
        <span className="ornament-divider-icon">♫</span>
      </div>

      {/* Hidden audio element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          preload="auto"
          onEnded={nextTrack}
        />
      )}

      {!hasTracks ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-2xl">🎶</p>
          <p className="text-gold-dim/50 text-xs">
            Aggiungi i tuoi file musicali nel componente MusicPlayer
          </p>
        </div>
      ) : (
        <>
          {/* Now playing */}
          <div className="bg-background/60 border border-gold-dim/20 rounded-md p-3 space-y-1">
            <p className="text-gold text-sm font-semibold truncate">
              {currentTrack?.title}
            </p>
            <p className="text-gold-dim/60 text-xs truncate">
              {currentTrack?.artist}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={prevTrack}
              className="p-2 rounded-full bg-gold-dim/10 text-gold-dim hover:bg-gold-dim/20 hover:text-gold active:bg-gold-dim/30 transition-colors"
              aria-label="Traccia precedente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-gold/20 text-gold hover:bg-gold/30 active:bg-gold/40 border border-gold/30 transition-colors"
              aria-label={isPlaying ? "Pausa" : "Riproduci"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 rounded-full bg-gold-dim/10 text-gold-dim hover:bg-gold-dim/20 hover:text-gold active:bg-gold-dim/30 transition-colors"
              aria-label="Traccia successiva"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className="text-gold-dim/50 text-xs">🔈</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 bg-gold-dim/20 rounded-full appearance-none cursor-pointer accent-gold"
            />
            <span className="text-gold-dim/50 text-xs w-8 text-right">{volume}%</span>
          </div>

          {/* Playlist */}
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {PLAYLIST.map((track, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentTrackIndex(i);
                  setIsPlaying(true);
                }}
                className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                  i === currentTrackIndex
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-gold-dim/50 hover:bg-gold-dim/10 hover:text-gold-dim"
                }`}
              >
                <span className="truncate block font-medieval">{track.title}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

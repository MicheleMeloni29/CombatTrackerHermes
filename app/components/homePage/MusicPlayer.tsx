"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Track {
  title: string;
  genere: string;
  src: string;
}

const PLAYLIST: Track[] = [
  // Fight
  { title: "Steel Against Granite", genere: "Fight", src: "/music/Fight/Steel_Against_Granite.mp3.mpeg" },
  { title: "The King's Last Gambit", genere: "Fight", src: "/music/Fight/The_King_s_Last_Gambit.mp3.mpeg" },

  // Tavern
  { title: "Bent Tankard Fast", genere: "Tavern", src: "/music/Tavern/Bent Tankard Fast.mp3" },
  { title: "Bent Tankard Reel", genere: "Tavern", src: "/music/Tavern/Bent Tankard Reel.mp3" },
  { title: "Lo-Fi Tavern", genere: "Tavern", src: "/music/Tavern/Lo-Fi Tavern.mp3" },
  { title: "Mead Barrel Overture", genere: "Tavern", src: "/music/Tavern/Mead Barrel Overture.mp3" },
  { title: "Mead Stained", genere: "Tavern", src: "/music/Tavern/Mead Stained.mp3" },
  { title: "Mossy Mug Tavern", genere: "Tavern", src: "/music/Tavern/Mossy Mug Tavern.mp3" },
  { title: "Mug of Thunder", genere: "Tavern", src: "/music/Tavern/Mug of Thunder.mp3" },
  { title: "Mugspell Kingdom", genere: "Tavern", src: "/music/Tavern/Mugspell Kingdom.mp3" },
  { title: "Oakfire Hearth", genere: "Tavern", src: "/music/Tavern/Oakfire Hearth.mp3" },

  // Exploration
  { title: "Fantasy Travel", genere: "Travel", src: "/music/Explore/Fantasy Travel.mp3" },
  { title: "Goodmoring Song", genere: "Travel", src: "/music/Explore/Goodmoring Song.mp3" },
  { title: "Moonbark Glade", genere: "Travel", src: "/music/Explore/Moonbark Glade.mp3" },
  { title: "Moonfern Wander", genere: "Travel", src: "/music/Explore/Moonfern Wander.mp3" },
];

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("Tutti");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const hasTracks = PLAYLIST.length > 0;
  const currentTrack = PLAYLIST[currentTrackIndex] ?? null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const genres = ["Tutti", ...Array.from(new Set(PLAYLIST.map((t) => t.genere)))];

  const filteredTracks =
    selectedGenre === "Tutti"
      ? PLAYLIST
      : PLAYLIST.filter((t) => t.genere === selectedGenre);

  const selectTrack = useCallback((nextIndex: number, shouldPlay = true) => {
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(shouldPlay);
  }, []);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isSeeking) setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
      selectTrack(nextIndex, false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrackIndex, isSeeking, selectTrack]);

  const togglePlay = () => setIsPlaying((v) => !v);

  const nextTrack = () => {
    if (!hasTracks) return;
    selectTrack((currentTrackIndex + 1) % PLAYLIST.length);
  };

  const prevTrack = () => {
    if (!hasTracks) return;
    selectTrack((currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleTrackClick = (globalIndex: number) => {
    selectTrack(globalIndex);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === "Tutti") return;

    if (currentTrack?.genere === genre) return;

    const firstInGenre = PLAYLIST.findIndex((track) => track.genere === genre);
    if (firstInGenre !== -1) {
      selectTrack(firstInGenre, isPlaying);
    }
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration]
  );

  const handleProgressDragStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsSeeking(true);
      handleProgressClick(e);

      const onMove = (ev: MouseEvent) => {
        const bar = progressRef.current;
        const audio = audioRef.current;
        if (!bar || !audio || !duration) return;
        const rect = bar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        audio.currentTime = ratio * duration;
        setCurrentTime(ratio * duration);
      };

      const onUp = () => {
        setIsSeeking(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [duration, handleProgressClick]
  );

  return (
    <div className="bg-background/80 rounded-lg p-4 backdrop-blur-sm">
      {/* Hidden audio element */}
      {currentTrack && (
        <audio ref={audioRef} src={currentTrack.src} preload="auto" />
      )}

      {!hasTracks ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-2xl">🎶</p>
          <p className="text-gold-dim/50 text-xs">
            Aggiungi i tuoi file musicali nella cartella /public/music/
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ============================================================
              SEZIONE 1: TRACCIA IN RIPRODUZIONE
              ============================================================ */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            {/* Titolo + genere */}
            <div className="text-center space-y-1">
              <p className="text-gold font-medieval text-base font-semibold truncate">
                {currentTrack?.title}
              </p>
              <p className="text-gold-dim/50 text-[10px] uppercase tracking-widest">
                {currentTrack?.genere}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div
                ref={progressRef}
                className="relative h-1.5 bg-gold-dim/15 rounded-full cursor-pointer group"
                onMouseDown={handleProgressDragStart}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-gold/70 rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold border-2 border-background shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gold-dim/40 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controlli play/pause/next/prev */}
            <div className="flex items-center justify-center gap-4">
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
                className="p-3.5 rounded-full bg-gold/20 text-gold hover:bg-gold/30 active:bg-gold/40 border border-gold/30 transition-colors"
                aria-label={isPlaying ? "Pausa" : "Riproduci"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
            <div className="flex items-center gap-2 px-2">
              <span className="text-gold-dim/40 text-xs">🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 bg-gold-dim/20 rounded-full appearance-none cursor-pointer accent-gold"
              />
              <span className="text-gold-dim/40 text-[10px] w-7 text-right font-mono">{volume}%</span>
            </div>
          </div>

          {/* ============================================================
              DIVISORE
              ============================================================ */}
          <div className="ornament-divider">
            <span className="ornament-divider-icon">♫</span>
          </div>

          {/* ============================================================
              SEZIONE 2: PLAYLIST
              ============================================================ */}
          <div className="space-y-2">
            {/* Bottoni filtro genere */}
            <div className="flex gap-2">
              {genres.map((genre) => {
                const isActive = selectedGenre === genre;
                const icon =
                  genre === "Tutti" ? "🎵" :
                  genre === "Fight" ? "⚔️" :
                  genre === "Tavern" ? "🍺" :
                  genre === "Travel" ? "🗺️" :
                  "🎶";
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreChange(genre)}
                    title={genre}
                    className={`w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-gold/20 border border-gold/40"
                        : "bg-gold-dim/10 border border-gold-dim/20 hover:bg-gold-dim/20"
                    }`}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Lista tracce */}
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {filteredTracks.length === 0 ? (
                <div className="text-center py-6 text-gold-dim/30 text-xs">
                  Nessuna traccia in questo genere
                </div>
              ) : (
                filteredTracks.map((track) => {
                  const globalIdx = PLAYLIST.indexOf(track);
                  const isCurrent = globalIdx === currentTrackIndex;

                  return (
                    <button
                      key={globalIdx}
                      onClick={() => handleTrackClick(globalIdx)}
                      className={`w-full text-left px-3 py-2.5 rounded-md text-xs transition-colors ${
                        isCurrent
                          ? "bg-gold/10 text-gold border border-gold/20"
                          : "text-gold-dim/50 hover:bg-gold-dim/10 hover:text-gold-dim border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isCurrent && isPlaying ? (
                          <span className="text-gold text-[10px] animate-pulse shrink-0">▶</span>
                        ) : (
                          <span className="text-gold-dim/20 text-[10px] shrink-0">♪</span>
                        )}
                        <span className={`truncate block flex-1 ${isCurrent ? "font-medieval" : ""}`}>
                          {track.title}
                        </span>
                        <span className="text-gold-dim/30 text-[10px] shrink-0 uppercase tracking-wider">
                          {track.genere}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Track {
  title: string;
  genre: string;
  src: string;
}

const PLAYLIST: Track[] = [
  { title: "Steel Against Granite", genre: "Fight", src: "/music/Fight/Steel_Against_Granite.mp3.mpeg" },
  { title: "The King's Last Gambit", genre: "Fight", src: "/music/Fight/The_King_s_Last_Gambit.mp3.mpeg" },
  { title: "Bent Tankard Fast", genre: "Tavern", src: "/music/Tavern/Bent Tankard Fast.mp3" },
  { title: "Bent Tankard Reel", genre: "Tavern", src: "/music/Tavern/Bent Tankard Reel.mp3" },
  { title: "Lo-Fi Tavern", genre: "Tavern", src: "/music/Tavern/Lo-Fi Tavern.mp3" },
  { title: "Mead Barrel Overture", genre: "Tavern", src: "/music/Tavern/Mead Barrel Overture.mp3" },
  { title: "Mead Stained", genre: "Tavern", src: "/music/Tavern/Mead Stained.mp3" },
  { title: "Mossy Mug Tavern", genre: "Tavern", src: "/music/Tavern/Mossy Mug Tavern.mp3" },
  { title: "Mug of Thunder", genre: "Tavern", src: "/music/Tavern/Mug of Thunder.mp3" },
  { title: "Mugspell Kingdom", genre: "Tavern", src: "/music/Tavern/Mugspell Kingdom.mp3" },
  { title: "Oakfire Hearth", genre: "Tavern", src: "/music/Tavern/Oakfire Hearth.mp3" },
  { title: "Fantasy Travel", genre: "Travel", src: "/music/Explore/Fantasy Travel.mp3" },
  { title: "Goodmoring Song", genre: "Travel", src: "/music/Explore/Goodmoring song.mp3" },
  { title: "Moonbark Glade", genre: "Travel", src: "/music/Explore/Moonbark Glade.mp3" },
  { title: "Moonfern Wander", genre: "Travel", src: "/music/Explore/Moonfern Wander.mp3" },
];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState("Tutti");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex] ?? null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const genres = ["Tutti", ...Array.from(new Set(PLAYLIST.map((track) => track.genre)))];
  const filteredTracks =
    selectedGenre === "Tutti"
      ? PLAYLIST
      : PLAYLIST.filter((track) => track.genre === selectedGenre);

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
  }, [currentTrackIndex, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
      selectTrack(nextIndex, false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex, selectTrack]);

  const nextTrack = () => {
    selectTrack((currentTrackIndex + 1) % PLAYLIST.length);
  };

  const previousTrack = () => {
    selectTrack((currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    const nextTime = (Number(event.target.value) / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === "Tutti" || currentTrack?.genre === genre) return;

    const firstTrackInGenre = PLAYLIST.findIndex((track) => track.genre === genre);
    if (firstTrackInGenre >= 0) {
      selectTrack(firstTrackInGenre, isPlaying);
    }
  };

  return (
    <section className="rounded-3xl border border-border-gold/20 bg-parchment/50 p-4 shadow-xl shadow-black/20">
      {currentTrack && <audio ref={audioRef} src={currentTrack.src} preload="metadata" />}

      <div className="rounded-3xl border border-border-gold/15 bg-background/45 p-4">
        <div className="text-center">
          <p className="truncate font-medieval text-2xl text-gold">{currentTrack?.title}</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-gold-dim/55">
            {currentTrack?.genre}
          </p>
        </div>

        <div className="mt-5">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleProgressChange}
            className="h-2 w-full cursor-pointer accent-gold"
            aria-label="Avanzamento traccia"
          />
          <div className="mt-1 flex justify-between font-mono text-xs font-bold text-gold-dim/45">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[56px_1fr_56px] items-center gap-3">
          <button
            type="button"
            onClick={previousTrack}
            className="flex h-14 items-center justify-center rounded-2xl border border-border-gold/25 text-gold transition hover:border-gold"
            aria-label="Traccia precedente"
          >
            <SkipBack size={22} />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((value) => !value)}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gold text-sm font-black text-background transition hover:bg-gold-bright"
            aria-label={isPlaying ? "Pausa" : "Riproduci"}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            {isPlaying ? "Pausa" : "Play"}
          </button>
          <button
            type="button"
            onClick={nextTrack}
            className="flex h-14 items-center justify-center rounded-2xl border border-border-gold/25 text-gold transition hover:border-gold"
            aria-label="Traccia successiva"
          >
            <SkipForward size={22} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Volume2 className="shrink-0 text-gold-dim" size={18} />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-2 flex-1 cursor-pointer accent-gold"
            aria-label="Volume"
          />
          <span className="w-10 text-right font-mono text-xs font-black text-gold-dim/55">
            {volume}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {genres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreChange(genre)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-black transition ${
                isActive
                  ? "border-gold bg-gold text-background"
                  : "border-border-gold/20 text-gold-dim hover:border-gold hover:text-gold"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {filteredTracks.map((track) => {
          const globalIndex = PLAYLIST.indexOf(track);
          const isCurrent = globalIndex === currentTrackIndex;
          return (
            <button
              key={`${track.genre}-${track.title}`}
              type="button"
              onClick={() => selectTrack(globalIndex)}
              className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border px-3 text-left transition ${
                isCurrent
                  ? "border-gold/45 bg-gold/10 text-gold"
                  : "border-border-gold/15 bg-background/35 text-gold-dim hover:border-border-gold/40"
              }`}
            >
              <span className="min-w-0 truncate text-sm font-bold">{track.title}</span>
              <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.16em] text-gold-dim/45">
                {track.genre}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

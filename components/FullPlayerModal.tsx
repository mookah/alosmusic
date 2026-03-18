"use client";

import Image from "next/image";

type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverURL?: string;
  coverUrl?: string;
};

type FullPlayerModalProps = {
  open: boolean;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatOne: boolean;
  liked: boolean;
  likeLoading: boolean;
  onClose: () => void;
  onTogglePlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleRepeat: () => void;
  onToggleLike: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
};

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function FullPlayerModal({
  open,
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  repeatOne,
  liked,
  likeLoading,
  onClose,
  onTogglePlayPause,
  onPrev,
  onNext,
  onToggleRepeat,
  onToggleLike,
  onSeek,
  onVolumeChange,
}: FullPlayerModalProps) {
  if (!open || !track) return null;

  const cover = track.coverURL || track.coverUrl || "/default-cover.jpg";

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.25),transparent_30%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_28%)]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Close
          </button>

          <div className="text-sm font-medium text-white/70">
            Now Playing
          </div>

          <div className="w-[74px]" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-2">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 rounded-[32px] bg-fuchsia-500/20 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
              <Image
                src={cover}
                alt={track.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 90vw, 420px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="mt-8 w-full max-w-md text-center">
            <h2 className="truncate text-2xl font-bold text-white">
              {track.title}
            </h2>
            <p className="mt-2 truncate text-base text-white/65">
              {track.artist}
            </p>
            {track.genre && (
              <p className="mt-1 text-sm text-fuchsia-300/80">{track.genre}</p>
            )}
          </div>

          <div className="mt-8 w-full max-w-md">
            <div className="flex items-center gap-3">
              <span className="w-10 text-right text-xs text-white/55">
                {formatTime(currentTime)}
              </span>

              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                disabled={!duration}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="w-full accent-white disabled:opacity-50"
                aria-label="Seek"
              />

              <span className="w-10 text-xs text-white/55">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={onPrev}
              className="text-2xl text-white/75 transition hover:text-white"
              title="Previous"
            >
              ⏮
            </button>

            <button
              type="button"
              onClick={onTogglePlayPause}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-black shadow-xl transition hover:scale-105"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              type="button"
              onClick={onNext}
              className="text-2xl text-white/75 transition hover:text-white"
              title="Next"
            >
              ⏭
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onToggleRepeat}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                repeatOne
                  ? "border-fuchsia-500/40 bg-fuchsia-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]"
              }`}
            >
              🔁 {repeatOne ? "Repeat On" : "Repeat Off"}
            </button>

            <button
              type="button"
              onClick={onToggleLike}
              disabled={likeLoading}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                liked
                  ? "border-red-500/40 bg-red-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {liked ? "❤️ Liked" : "🤍 Like"}
            </button>
          </div>

          <div className="mt-8 flex w-full max-w-xs items-center gap-3">
            <span className="text-sm text-white/60">🔊</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full accent-white"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
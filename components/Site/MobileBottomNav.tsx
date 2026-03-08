"use client";

import { Track } from "@/lib/playerStore";

type MobileNowPlayingProps = {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (value: number) => void;
  onVolume: (value: number) => void;
  onMute: () => void;
};

function fmtTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getCover(track: Track | null | undefined) {
  if (!track) return "";
  return track.coverUrl || track.coverURL || "";
}

export default function MobileNowPlaying({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolume,
  onMute,
}: MobileNowPlayingProps) {
  if (!track) return null;

  const progress =
    duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur md:hidden">
      <div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/10">
            {getCover(track) ? (
              <img
                src={getCover(track)}
                alt={track.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-lg text-white/50">
                ♪
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {track.title}
            </p>
            <p className="truncate text-xs text-white/60">{track.artist}</p>
          </div>

          <button
            onClick={onTogglePlay}
            className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="w-10 text-[11px] text-white/60">
            {fmtTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full"
          />

          <span className="w-10 text-right text-[11px] text-white/60">
            {fmtTime(duration)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={onPrev}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80"
          >
            Prev
          </button>

          <button
            onClick={onMute}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80"
          >
            {muted ? "Unmute" : "Mute"}
          </button>

          <div className="flex flex-1 items-center gap-2">
            <span className="text-[11px] text-white/50">Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={onNext}
            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

type Track = {
  id?: string;
  title?: string;
  artist?: string;
  genre?: string;
  coverURL?: string;
  audioURL?: string;
};

type MobileNowPlayingProps = {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  onPlay?: () => void | Promise<void>;
  onPause?: () => void;
  onStop?: () => void;
  onSeek?: (value: number) => void;
};

export default function MobileNowPlaying({
  open,
  onClose,
  track,
  isPlaying,
  currentTime = 0,
  duration = 0,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: MobileNowPlayingProps) {
  if (!open || !track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <h2 className="text-lg font-semibold">Now Playing</h2>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/10 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-8">
        <div className="mb-6 aspect-square w-full overflow-hidden rounded-2xl bg-white/5">
          {track.coverURL ? (
            <img
              src={track.coverURL}
              alt={track.title || "Cover"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/40">
              No Cover
            </div>
          )}
        </div>

        <h3 className="text-center text-2xl font-bold">
          {track.title || "Untitled Song"}
        </h3>

        <p className="mt-1 text-center text-white/70">
          {track.artist || "Unknown Artist"}
          {track.genre ? ` • ${track.genre}` : ""}
        </p>

        <div className="mt-6 w-full">
          <div className="mb-2 flex justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onSeek?.(Number(e.target.value))}
            className="w-full accent-purple-500"
          />

          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-purple-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          <button
            onClick={() => onPlay?.()}
            className="rounded-2xl bg-purple-600 px-4 py-3 font-semibold hover:bg-purple-500"
          >
            Play
          </button>

          <button
            onClick={() => onPause?.()}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold hover:bg-white/10"
          >
            Pause
          </button>

          <button
            onClick={() => onStop?.()}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold hover:bg-white/10"
          >
            Stop
          </button>
        </div>

        <div className="mt-4 text-sm text-white/60">
          {isPlaying ? "Playing" : "Paused"}
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
"use client";

import type { SongItem } from "./MusicPlayer";

export default function SongCarousel({
  songs,
  activeId,
  onPick,
}: {
  songs: SongItem[];
  activeId: string | null;
  onPick: (s: SongItem) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Trending Right Now</div>
        <div className="text-xs text-white/60">{songs.length} song(s)</div>
      </div>

      {songs.length === 0 ? (
        <div className="text-sm text-white/70">
          No songs found yet. Upload one first.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {songs.map((s) => {
            const active = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onPick(s)}
                className={[
                  "min-w-[180px] text-left rounded-xl border p-3",
                  "bg-black/30 hover:bg-black/40 transition",
                  active ? "border-purple-500" : "border-white/10",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center">
                    <span className="text-lg font-bold text-white/80">
                      {s.title?.slice(0, 1)?.toUpperCase() ?? "♪"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">{s.title}</div>
                    <div className="text-xs text-white/60 truncate">
                      {s.artist || "Unknown Artist"}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-flex items-center rounded-lg bg-purple-600 px-3 py-1 text-xs font-semibold">
                    {active ? "Playing" : "Play"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
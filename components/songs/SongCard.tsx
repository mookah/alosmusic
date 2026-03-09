"use client";

import { Track } from "@/lib/playerStore";

export default function SongCard({ track }: { track: Track }) {
  const cover = track.coverURL || "/default-cover.jpg";

  function handlePlay() {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("alos:play", {
        detail: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          genre: track.genre,
          coverURL: track.coverURL || "",
          audioURL: track.audioURL || "",
          queue: [track],
          startIndex: 0,
        },
      })
    );
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30 hover:border-fuchsia-500/30 transition">
      <div className="relative">
        <img
          src={cover}
          alt={track.title}
          className="h-40 w-full object-cover"
        />

        <button
          onClick={handlePlay}
          className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white hover:bg-fuchsia-600 transition"
        >
          ▶ Play
        </button>
      </div>

      <div className="p-3">
        <div className="truncate text-sm font-semibold text-white">
          {track.title}
        </div>

        <div className="truncate text-xs text-white/60">
          {track.artist}
        </div>
      </div>
    </div>
  );
}
"use client";

import { Track } from "@/lib/playerStore";

export default function SongCard({ track }: { track: Track }) {
  const handlePlay = () => {
    window.dispatchEvent(new CustomEvent("alos:play", { detail: track }));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/song/${track.id}`
        : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `${track.title} by ${track.artist} on ALOSMUSIC`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Song link copied");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer transition hover:bg-white/10"
    >
      <div className="relative aspect-[4/5] bg-black/20 overflow-hidden">
        {track.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverUrl}
            alt={track.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30 text-3xl">
            ♪
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          className="absolute bottom-3 left-3 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500"
        >
          Play
        </button>
      </div>

      <div className="p-3">
        <div className="truncate text-base font-semibold text-white">
          {track.title}
        </div>

        <div className="truncate text-sm text-white/60">
          {track.artist}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60">
            {track.genre || "Gospel"}
          </span>

          <button
            onClick={handleShare}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
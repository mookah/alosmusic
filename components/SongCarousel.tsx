"use client";

import Image from "next/image";

export type SongItem = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl?: string;
  genre?: string;
};

export default function SongCarousel({
  songs,
  onSelect,
}: {
  songs: SongItem[];
  onSelect?: (song: SongItem) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {songs.map((song) => (
        <button
          key={song.id}
          type="button"
          onClick={() => onSelect?.(song)}
          className="group min-w-[170px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:bg-white/10"
        >
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={song.coverUrl || "/images/placeholder-cover.jpg"}
              alt={song.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>

          <div className="p-3">
            <div className="line-clamp-1 text-sm font-semibold text-white">
              {song.title}
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-white/70">
              {song.artist}
            </div>
            {song.genre ? (
              <div className="mt-2 text-[11px] text-white/50">{song.genre}</div>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
}
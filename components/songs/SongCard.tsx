"use client";

import Image from "next/image";
import React from "react";

type SongCardProps = {
  title: string;
  artist: string;
  coverURL?: string;
  genre?: string;
  plays?: number;
  active?: boolean;
  onPlay?: () => void;
  className?: string;
};

function formatPlays(num?: number) {
  const value = Number(num || 0);

  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

export default function SongCard({
  title,
  artist,
  coverURL = "/default-cover.jpg",
  genre = "Gospel",
  plays,
  active = false,
  onPlay,
  className = "",
}: SongCardProps) {
  return (
    <div
      className={`group overflow-hidden rounded-[24px] border transition ${
        active
          ? "border-fuchsia-500/50 bg-white/[0.06] shadow-[0_0_30px_rgba(217,70,239,0.2)]"
          : "border-white/10 bg-white/[0.03] hover:border-fuchsia-500/30 hover:bg-white/[0.05]"
      } ${className}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={coverURL || "/default-cover.jpg"}
          alt={title}
          fill
          unoptimized
          sizes="(max-width: 768px) 170px, 210px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

        <button
          type="button"
          onClick={onPlay}
          className="absolute bottom-3 right-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(168,85,247,0.35)] transition hover:scale-[1.03]"
        >
          {active ? "Playing" : "Play"}
        </button>
      </div>

      <div className="p-4">
        <div className="truncate text-base font-semibold text-white">
          {title}
        </div>

        <div className="mt-1 truncate text-sm text-white/60">
          {artist}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/65">
            {genre}
          </span>

          {typeof plays !== "undefined" && (
            <span className="text-xs text-white/50">
              {formatPlays(plays)} plays
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
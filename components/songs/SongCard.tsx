"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

type SongCardProps = {
  id?: string;
  title: string;
  artist: string;
  coverURL?: string;
  genre?: string;
  plays?: number;
  audioUrl?: string;
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
  id,
  title,
  artist,
  coverURL = "/default-cover.jpg",
  genre = "Gospel",
  plays,
  audioUrl = "",
  active = false,
  onPlay,
  className = "",
}: SongCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMenuMessage, setShowMenuMessage] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  function showTemporaryMessage(message: string) {
    setShowMenuMessage(message);
    window.setTimeout(() => {
      setShowMenuMessage("");
    }, 1800);
  }

  async function handleShare() {
    try {
      const shareUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${window.location.pathname}${id ? `?song=${id}` : ""}`
          : "";

      if (navigator.share) {
        await navigator.share({
          title,
          text: `${title} - ${artist}`,
          url: shareUrl,
        });
        showTemporaryMessage("Shared");
      } else {
        await navigator.clipboard.writeText(shareUrl || `${title} - ${artist}`);
        showTemporaryMessage("Link copied");
      }
    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setMenuOpen(false);
    }
  }

  function handleDownload() {
    if (!audioUrl) {
      showTemporaryMessage("No download available");
      setMenuOpen(false);
      return;
    }

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showTemporaryMessage("Download started");
    setMenuOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
      <div
        className={`group overflow-visible rounded-[24px] border transition ${
          active
            ? "border-fuchsia-500/50 bg-white/[0.06] shadow-[0_0_30px_rgba(217,70,239,0.2)]"
            : "border-white/10 bg-white/[0.03] hover:border-fuchsia-500/30 hover:bg-white/[0.05]"
        } ${className}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-[24px]">
          <Image
            src={coverURL || "/default-cover.jpg"}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 768px) 170px, 210px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

          <div className="absolute right-3 top-3 z-20" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full border border-white/10 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur transition hover:bg-black/70"
              aria-label="Open song menu"
              title="More"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-[120] min-w-[170px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={handleShare}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
                >
                  Share
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
                >
                  Download
                </button>
              </div>
            )}
          </div>

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

      {showMenuMessage && (
        <div className="fixed bottom-24 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-black/85 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
          {showMenuMessage}
        </div>
      )}
    </>
  );
}
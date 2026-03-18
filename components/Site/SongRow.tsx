"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

type SongRowProps = {
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

export default function SongRow({
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
}: SongRowProps) {
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
        className={`relative overflow-visible rounded-2xl border transition ${
          active
            ? "border-fuchsia-500/50 bg-white/[0.06] shadow-[0_0_24px_rgba(217,70,239,0.18)]"
            : "border-white/10 bg-white/[0.03] hover:border-fuchsia-500/30 hover:bg-white/[0.05]"
        } ${className}`}
      >
        <div className="flex items-center gap-3 p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
            <Image
              src={coverURL || "/default-cover.jpg"}
              alt={title}
              fill
              unoptimized
              sizes="56px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {title}
            </div>

            <div className="mt-0.5 truncate text-xs text-white/60">
              {artist}
            </div>

            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/45">
              <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] text-white/65">
                {genre}
              </span>

              {typeof plays !== "undefined" && (
                <span>{formatPlays(plays)} plays</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPlay}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(168,85,247,0.35)] transition hover:scale-[1.03]"
            >
              {active ? "Playing" : "Play"}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-sm text-white transition hover:bg-black/70"
                aria-label="Open song menu"
                title="More"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 z-[140] min-w-[170px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl">
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
          </div>
        </div>
      </div>

      {showMenuMessage && (
        <div className="fixed bottom-24 left-1/2 z-[160] -translate-x-1/2 rounded-full bg-black/85 px-4 py-2 text-sm text-white shadow-lg backdrop-blur">
          {showMenuMessage}
        </div>
      )}
    </>
  );
}
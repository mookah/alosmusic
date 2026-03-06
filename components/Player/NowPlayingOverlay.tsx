"use client";

import Link from "next/link";
import { Track } from "@/lib/playerStore";

export default function NowPlayingOverlay({
  open,
  onClose,
  track,
  isPlaying,
  currentTimeText,
  durationText,
  onTogglePlay,
  onNext,
  onPrev,
  queue,
}: {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  currentTimeText: string;
  durationText: string;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  queue: Track[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl p-4 md:p-8 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-white/80 text-sm">
            Now Playing
            <span className="text-white/30"> • </span>
            <Link href="/" className="text-white/60 hover:text-white">
              ALOSMUSIC
            </Link>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 flex-1 min-h-0">
          {/* LEFT: big cover + controls */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-7 overflow-hidden relative">
            {/* glow */}
            <div
              className="absolute -inset-24 blur-3xl opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(520px circle at 30% 30%, rgba(236,72,153,.30), rgba(168,85,247,.24), rgba(59,130,246,.18), transparent 65%)",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  {track?.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={track.coverUrl} alt={track.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-white/30">♪</div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-2xl font-semibold truncate">{track?.title || "No track"}</div>
                  <div className="text-white/70 truncate">
                    {track ? `${track.artist}${track.genre ? ` • ${track.genre}` : ""}` : "Pick a song"}
                  </div>
                  <div className="mt-1 text-xs text-white/50">
                    {currentTimeText} <span className="text-white/25">/</span> {durationText}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={onPrev}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 hover:bg-white/10"
                >
                  ◀
                </button>

                <button
                  onClick={onTogglePlay}
                  className="rounded-2xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>

                <button
                  onClick={onNext}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 hover:bg-white/10"
                >
                  ▶
                </button>
              </div>

              {/* Lyrics placeholder */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm font-semibold">Lyrics</div>
                <div className="mt-2 text-sm text-white/60">
                  Coming next: lyrics / synchronized text here.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Up Next */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Up Next</div>
              <div className="text-xs text-white/50">{queue.length} in queue</div>
            </div>

            <div className="mt-4 space-y-2 overflow-auto h-[calc(100%-28px)] pr-1">
              {queue.length === 0 ? (
                <div className="text-sm text-white/50">Queue is empty.</div>
              ) : (
                queue.slice(0, 30).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3"
                  >
                    <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      {t.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.coverUrl} alt={t.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-white/30 text-xs">♪</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-xs text-white/60 truncate">{t.artist}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Track } from "@/lib/playerStore";

export default function SongCard({ track }: { track: Track }) {
  const play = () => {
    // ✅ This triggers your BottomPlayer listener
    window.dispatchEvent(new CustomEvent("alos:play", { detail: track }));
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* cover */}
      <div className="relative aspect-[4/3]">
        {track.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverUrl}
            alt={track.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-white/5">
            {/* no cover: soft placeholder */}
            <div className="h-14 w-14 rounded-2xl border border-white/10 bg-black/40 grid place-items-center text-white/40">
              ♪
            </div>
          </div>
        )}

        {/* dark overlay on hover */}
        <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* premium play button overlay */}
        <button
          onClick={play}
          className="absolute left-3 bottom-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={`Play ${track.title}`}
        >
          <span className="relative inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/55 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-black/65">
            {/* tiny eq icon */}
            <span className="inline-flex items-end gap-[2px] h-4">
              <span className="alosCardBar alosCardBar1" />
              <span className="alosCardBar alosCardBar2" />
              <span className="alosCardBar alosCardBar3" />
            </span>
            Play
          </span>

          {/* glow */}
          <span
            className="pointer-events-none absolute -inset-3 rounded-2xl blur-xl opacity-70"
            style={{
              background:
                "radial-gradient(120px circle at 50% 50%, rgba(236,72,153,.30), rgba(168,85,247,.26), rgba(59,130,246,.22), transparent 65%)",
            }}
          />
        </button>

        {/* top-right duration badge (optional) */}
        <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/55 px-2 py-1 text-[11px] text-white/75 backdrop-blur opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {track.genre || "Gospel"}
        </div>
      </div>

      {/* info */}
      <div className="p-3">
        <div className="text-sm font-semibold truncate">{track.title}</div>
        <div className="text-xs text-white/60 truncate">{track.artist}</div>
      </div>

      {/* subtle hover lift */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div
          className="absolute -inset-8 blur-2xl"
          style={{
            background:
              "radial-gradient(240px circle at 30% 20%, rgba(168,85,247,.18), transparent 60%), radial-gradient(240px circle at 70% 80%, rgba(236,72,153,.16), transparent 60%)",
          }}
        />
      </div>

      <style jsx global>{`
        .alosCardBar {
          width: 3px;
          border-radius: 3px;
          background: linear-gradient(
            180deg,
            rgba(236, 72, 153, 0.95),
            rgba(168, 85, 247, 0.95),
            rgba(59, 130, 246, 0.95)
          );
          height: 55%;
          animation: alosCardEQ 0.9s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
          opacity: 0.9;
        }
        .alosCardBar1 {
          animation-delay: 0ms;
        }
        .alosCardBar2 {
          animation-delay: 140ms;
        }
        .alosCardBar3 {
          animation-delay: 280ms;
        }
        @keyframes alosCardEQ {
          0% {
            height: 30%;
          }
          35% {
            height: 100%;
          }
          70% {
            height: 45%;
          }
          100% {
            height: 70%;
          }
        }
      `}</style>
    </div>
  );
}
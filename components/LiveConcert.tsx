"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type Props = {
  mode?: "offline" | "youtube" | "hls" | "mp4";
  youtubeIdOrUrl?: string;
  src?: string; // .m3u8 or .mp4 depending on mode
  label?: string;
  viewers?: number; // optional manual number
};

export default function LiveConcert({
  mode = "offline",
  youtubeIdOrUrl,
  src,
  label,
  viewers,
}: Props) {
  const isLive =
    mode === "youtube" ? Boolean(youtubeIdOrUrl) :
    mode === "hls" ? Boolean(src) :
    mode === "mp4" ? Boolean(src) :
    false;

  const viewerText =
    typeof viewers === "number" ? `${viewers.toLocaleString()} watching` : null;

  return (
    <div className="mt-6 w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      {/* Header row */}
      <div className="px-3 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={isLive ? "text-red-500 font-semibold" : "text-white/40 font-semibold"}>
            {isLive ? "● LIVE" : "● OFFLINE"}
          </span>
          <span className="text-white/40">Concert</span>
        </div>

        <span className="text-white/40">{viewerText ?? ""}</span>
      </div>

      {/* Video frame */}
      <div className="aspect-video bg-black relative overflow-hidden">
        {/* ✅ LIVE badge overlay */}
        {isLive && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
            <span className="bg-red-600 text-white text-[11px] px-2 py-1 rounded-full animate-pulse font-semibold shadow">
              LIVE
            </span>
          </div>
        )}

        {mode === "youtube" ? (
          <YouTubeEmbed idOrUrl={youtubeIdOrUrl} />
        ) : mode === "hls" ? (
          <HlsVideo src={src} />
        ) : mode === "mp4" ? (
          src ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
              src={src}
            />
          ) : (
            <WaitingScreen />
          )
        ) : (
          <WaitingScreen />
        )}
      </div>

      {/* Footer line */}
      <div className="px-3 py-2 text-[11px] text-white/40">
        {label ?? (isLive ? "Worship Live" : "Waiting for Live Feed…")}
      </div>
    </div>
  );
}

/* -------------------- YouTube -------------------- */
function YouTubeEmbed({ idOrUrl }: { idOrUrl?: string }) {
  const embedUrl = toYouTubeEmbedUrl(idOrUrl);
  if (!embedUrl) return <WaitingScreen />;

  return (
    <iframe
      className="absolute inset-0 w-full h-full"
      src={embedUrl}
      title="YouTube Live"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  );
}

function toYouTubeEmbedUrl(input?: string) {
  if (!input) return null;

  if (input.includes("youtube.com") || input.includes("youtu.be")) {
    if (input.includes("/embed/")) return input;

    const short = input.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;

    const watch = input.match(/[?&]v=([A-Za-z0-9_-]+)/);
    if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;

    return null;
  }

  return `https://www.youtube.com/embed/${input}`;
}

/* -------------------- HLS (.m3u8) -------------------- */
function HlsVideo({ src }: { src?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;

    // Safari plays HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [src]);

  if (!src) return <WaitingScreen />;

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover"
      controls
      playsInline
    />
  );
}

/* -------------------- Premium Waiting Screen -------------------- */
function WaitingScreen() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      {/* Ambient glow */}
      <div className="absolute -inset-16 bg-gradient-to-br from-purple-600/15 via-transparent to-blue-500/15 blur-3xl" />

      <div className="relative flex flex-col items-center gap-3">
        {/* Aura ring + Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 rounded-full border border-purple-500/35 animate-spin-slow" />
          <div className="absolute w-36 h-36 rounded-full bg-purple-500/10 blur-2xl" />

          <img
            src="/images/alos-logo.jpg"
            alt="ALOSMusic"
            className="w-20 h-20 object-contain animate-logo-glow"
          />
        </div>

        <div className="text-center">
          <div className="text-white font-semibold tracking-wide">ALOSMUSIC</div>
          <div className="text-white/50 text-xs">Waiting for feed</div>
        </div>

        {/* Equalizer */}
        <div className="flex items-end gap-1.5 mt-1">
          <span className="eq" />
          <span className="eq" />
          <span className="eq" />
          <span className="eq" />
          <span className="eq" />
        </div>
      </div>
    </div>
  );
}
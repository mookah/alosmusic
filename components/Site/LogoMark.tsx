"use client";

import Link from "next/link";

export default function LogoMark({
  href,
  size = 40,
  variant = "active",
}: {
  href?: string;
  size?: number;
  variant?: "calm" | "active" | "equalizer";
}) {
  const isEqualizer = variant === "equalizer";
  const isActive = variant === "active";

  const logo = (
    <div
      className="relative flex items-center justify-center rounded-2xl"
      style={{ width: size, height: size }}
    >
      {/* glow */}
      <div
        className={`absolute inset-0 rounded-2xl ${
          isEqualizer
            ? "bg-purple-500/30 blur-xl animate-pulse"
            : isActive
            ? "bg-purple-500/20 blur-lg"
            : "bg-white/5"
        }`}
      />

      {/* spinning ring */}
      {isEqualizer && (
        <div className="absolute inset-0 rounded-2xl border border-purple-400/40 ring-spin" />
      )}

      {/* logo container */}
      <div
        className={`relative z-10 flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur ${
          isEqualizer ? "shadow-[0_0_30px_rgba(168,85,247,.35)]" : ""
        }`}
        style={{ width: size, height: size }}
      >
        {/* LOGO IMAGE */}
        <img
          src="/logo.png"
          alt="ALOSMUSIC"
          className={`object-contain ${
            isActive ? "animate-logo-glow" : ""
          }`}
          style={{ width: size * 0.65 }}
        />

        {/* equalizer overlay */}
        {isEqualizer && (
          <div className="absolute bottom-[4px] flex items-end gap-[2px]">
            <span className="eq-bar h-2 w-[3px] bg-fuchsia-400 rounded-full" />
            <span className="eq-bar h-4 w-[3px] bg-purple-400 rounded-full" />
            <span className="eq-bar h-3 w-[3px] bg-pink-400 rounded-full" />
            <span className="eq-bar h-5 w-[3px] bg-fuchsia-400 rounded-full" />
            <span className="eq-bar h-3 w-[3px] bg-purple-400 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
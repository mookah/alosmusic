// components/LogoLoader.tsx
"use client";

import React from "react";

type Props = {
  label?: string;
  progress?: number; // 0 - 100
  size?: number;
};

export default function LogoLoader({ label = "Loading...", progress, size = 54 }: Props) {
  const pct = typeof progress === "number" ? Math.max(0, Math.min(100, Math.round(progress))) : undefined;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5" />
        <div className="absolute inset-0 rounded-full ring-glow" />
        <div className="absolute inset-0 rounded-full ring-spin" />

        <div
          className="relative z-10 grid place-items-center rounded-2xl bg-black/70 border border-white/10
          shadow-[0_0_40px_rgba(168,85,247,.18)]"
          style={{ width: size * 0.62, height: size * 0.62 }}
        >
          <svg width={size * 0.34} height={size * 0.34} viewBox="0 0 64 64" fill="none">
            <path
              d="M32 6L54 58H44.5L39.8 46.6H24.2L19.5 58H10L32 6Z"
              fill="url(#grad)"
            />
            <path d="M27 36H37L32 23L27 36Z" fill="rgba(0,0,0,.45)" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                <stop offset="50%" stopColor="rgb(236, 72, 153)" />
                <stop offset="100%" stopColor="rgb(99, 102, 241)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-white/80">{label}</p>
        {typeof pct === "number" && <p className="text-xs text-white/60 mt-1">{pct}%</p>}
      </div>
    </div>
  );
}
// components/LoadingOverlay.tsx
"use client";

import React from "react";
import LogoLoader from "./LogoLoader";

export default function LoadingOverlay({
  show,
  label,
  progress,
}: {
  show: boolean;
  label?: string;
  progress?: number;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-10 py-8 shadow-2xl">
        <LogoLoader label={label || "Loading..."} progress={progress} />
      </div>
    </div>
  );
}
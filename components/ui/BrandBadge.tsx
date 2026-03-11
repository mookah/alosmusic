"use client";

import React from "react";
import Image from "next/image";

type BrandBadgeProps = {
  text?: string;
  logoSrc?: string;
  className?: string;
};

export default function BrandBadge({
  text = "ALOSMUSIC",
  logoSrc = "/logo.png",
  className = "",
}: BrandBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300 ${className}`}
    >
      <Image
        src={logoSrc}
        alt={text}
        width={20}
        height={20}
        className="h-5 w-5 object-contain"
      />
      <span>{text}</span>
    </div>
  );
}
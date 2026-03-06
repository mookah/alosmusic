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
  const logo = (
    <div
      className="relative flex items-center justify-center rounded-xl bg-black"
      style={{ width: size, height: size }}
    >
      <div
        className={`absolute inset-0 rounded-xl ${
          variant === "equalizer"
            ? "animate-pulse bg-purple-500/30 blur-lg"
            : "bg-purple-500/20"
        }`}
      />

      <div className="relative text-lg font-bold text-white">A</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
"use client";

import Link from "next/link";
import Image from "next/image";

type Variant = "active" | "equalizer";

export default function LogoMark({
  href = "/",
  size = 44,
  variant = "active",
}: {
  href?: string;
  size?: number;
  variant?: Variant;
}) {
  return (
    <Link href={href} className="relative inline-flex items-center justify-center">

      {/* Glow */}
      <span
        className={`absolute -inset-2 rounded-2xl blur-xl ${
          variant === "equalizer"
            ? "bg-gradient-to-r from-purple-500/60 to-pink-500/60 animate-pulse"
            : "bg-purple-500/30"
        }`}
      />

      {/* Logo */}
      <span
        className="relative grid place-items-center rounded-2xl border border-white/10 bg-black/80 overflow-hidden"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="ALOSMUSIC"
          fill
          sizes={`${size}px`}
          className="object-contain p-2"
        />

        {/* Equalizer bars */}
        {variant === "equalizer" && (
          <span className="absolute bottom-1 flex gap-[2px]">
            <span className="eqbar h-[6px]" />
            <span className="eqbar h-[10px]" />
            <span className="eqbar h-[7px]" />
            <span className="eqbar h-[11px]" />
            <span className="eqbar h-[8px]" />
          </span>
        )}
      </span>

      <style jsx>{`
        .eqbar {
          width: 3px;
          background: #ec4899;
          border-radius: 999px;
          animation: eq 900ms infinite ease-in-out;
          transform-origin: bottom;
        }

        .eqbar:nth-child(1) { animation-duration: 700ms; }
        .eqbar:nth-child(2) { animation-duration: 600ms; }
        .eqbar:nth-child(3) { animation-duration: 850ms; }
        .eqbar:nth-child(4) { animation-duration: 650ms; }
        .eqbar:nth-child(5) { animation-duration: 780ms; }

        @keyframes eq {
          0%,100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.6); }
        }
      `}</style>
    </Link>
  );
}
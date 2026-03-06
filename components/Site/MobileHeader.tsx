"use client";

import Link from "next/link";

export default function MobileHeader({
  onAuth,
}: {
  onAuth: () => void;
}) {
  return (
    <header className="md:hidden sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold tracking-wide">
          ALOSMUSIC
        </Link>

        <button
          onClick={onAuth}
          className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition"
        >
          Sign in
        </button>
      </div>
    </header>
  );
}
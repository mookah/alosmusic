"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";

export default function MobileHeader({
  onAuth,
}: {
  onAuth: () => void;
}) {
  const pathname = usePathname();

  let variant: "calm" | "active" | "equalizer" = "active";
  if (pathname === "/") variant = "equalizer";

  return (
    <header className="md:hidden sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <LogoMark href="/" size={38} variant={variant} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">ALOSMUSIC</div>
            <div className="truncate text-[11px] text-white/60">
              Gospel • Upload • Stream
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/upload"
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-500"
          >
            Upload
          </Link>

          <button
            onClick={onAuth}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
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
  if (pathname === "/browse") variant = "active";
  if (pathname === "/upload") variant = "active";
  if (pathname === "/profile" || pathname === "/artist-profile") {
    variant = "active";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark href="/" size={38} variant={variant} />

          <div className="min-w-0">
            <Link
              href="/"
              className="block truncate text-sm font-semibold text-white"
            >
              ALOSMUSIC
            </Link>

            <div className="truncate text-[11px] text-white/60">
              Gospel • Upload • Stream
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/upload"
            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-500"
          >
            Upload
          </Link>

          <Link
            href="/signup"
            className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 transition hover:bg-fuchsia-500/20"
          >
            Sign up
          </Link>

          <button
            type="button"
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
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";

export default function Topbar({ onAuth }: { onAuth: () => void }) {
  const pathname = usePathname();

  const variant: "calm" | "active" | "equalizer" =
    pathname === "/" ? "equalizer" : "active";

  const navItem = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`relative text-sm font-medium transition ${
          active ? "text-white" : "text-white/70 hover:text-white"
        }`}
      >
        {label}
        {active && (
          <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-fuchsia-500" />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-5 lg:px-6">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-fuchsia-500/15 blur-xl" />
            <LogoMark href="/" size={44} variant={variant} />
          </div>

          <div className="min-w-0">
            <div className="truncate font-semibold leading-tight text-white">
              ALOSMUSIC
            </div>

            <div className="truncate text-xs text-white/60">
              Gospel • Upload • Stream
            </div>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItem("/", "Home")}
          {navItem("/browse", "Browse")}
          {navItem("/artist-profile", "Profile")}
        </nav>

        {/* RIGHT */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/upload"
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500"
          >
            Upload
          </Link>

          <button
            onClick={onAuth}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Login / Sign up
          </button>
        </div>

        {/* MOBILE RIGHT */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/upload"
            className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500"
          >
            Upload
          </Link>

          <button
            onClick={onAuth}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
          >
            Login
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="border-t border-white/5 px-4 py-2 md:hidden">
        <nav className="flex items-center justify-center gap-5">
          {navItem("/", "Home")}
          {navItem("/browse", "Browse")}
          {navItem("/artist-profile", "Profile")}
        </nav>
      </div>
    </header>
  );
}
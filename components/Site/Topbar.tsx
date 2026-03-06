"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";

export default function Topbar({ onAuth }: { onAuth: () => void }) {
  const pathname = usePathname();

  let variant: "calm" | "active" | "equalizer" = "active";

  if (pathname === "/") variant = "equalizer";
  if (pathname === "/browse") variant = "active";
  if (pathname === "/upload") variant = "active";
  if (pathname === "/profile" || pathname === "/artist-profile")
    variant = "active";

  const navItem = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`text-sm transition ${
          active ? "text-white" : "text-white/70 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-5 lg:px-6">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark href="/" size={44} variant={variant} />

          <div className="min-w-0">
            <div className="truncate font-semibold leading-tight">
              ALOSMUSIC
            </div>
            <div className="truncate text-xs text-white/60">
              Gospel • Upload • Stream
            </div>
          </div>
        </div>

        {/* Center nav desktop only */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItem("/", "Home")}
          {navItem("/browse", "Browse")}
          {navItem("/artist-profile", "Profile")}
        </nav>

        {/* Right desktop only */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/upload"
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-purple-600/30 transition hover:bg-purple-500"
          >
            Upload
          </Link>

          <button
            onClick={onAuth}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Login / Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
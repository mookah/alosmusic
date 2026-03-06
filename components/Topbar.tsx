"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";

export default function Topbar({ onAuth }: { onAuth: () => void }) {
  const pathname = usePathname();

  const navItem = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`text-sm transition ${active ? "text-white" : "text-white/70 hover:text-white"}`}
      >
        {label}
      </Link>
    );
  };

  const variant = pathname === "/" ? "equalizer" : "active";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between gap-4">
        {/* Left brand */}
        <div className="flex items-center gap-3 min-w-0">
          <LogoMark href="/" size={44} variant={variant} />
          <div className="min-w-0">
            <div className="font-semibold leading-tight">ALOSMUSIC</div>
            <div className="text-xs text-white/60 truncate">Gospel • Upload • Stream</div>
          </div>
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItem("/", "Home")}
          {navItem("/browse", "Browse")}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500 transition"
          >
            Upload
          </Link>

          <button
            onClick={onAuth}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition"
          >
            Login / Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
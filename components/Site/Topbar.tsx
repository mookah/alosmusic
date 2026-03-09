"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar({ onAuth }: { onAuth?: () => void }) {
  const pathname = usePathname();

  const navItem = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`text-sm font-medium transition ${
          active
            ? "text-white border-b-2 border-fuchsia-500 pb-1"
            : "text-white/70 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-wide text-white">
              ALOSMUSIC
            </span>
            <span className="text-xs text-white/50">
              Gospel • Upload • Stream
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItem("/", "Home")}
            {navItem("/browse", "Browse")}
            {navItem("/artist-profile", "Profile")}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500"
          >
            Upload
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500/20"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
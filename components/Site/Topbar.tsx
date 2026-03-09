"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Topbar({ onAuth }: { onAuth?: () => void }) {
  const pathname = usePathname();

  const navItem = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`relative text-sm font-medium transition-all duration-200 ${
          active
            ? "text-white"
            : "text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]"
        }`}
      >
        {label}

        {active && (
          <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500" />
        )}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-fuchsia-500/20 blur-xl transition duration-500 group-hover:bg-fuchsia-500/30" />
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_30px_rgba(217,70,239,0.18)] transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="ALOSMusic"
                  width={34}
                  height={34}
                  className="object-contain transition duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="bg-gradient-to-r from-white via-fuchsia-100 to-violet-200 bg-clip-text text-lg font-black tracking-[0.18em] text-transparent">
                ALOSMUSIC
              </div>

              <div className="mt-0.5 flex items-end gap-1">
                <span className="h-2 w-1 animate-pulse rounded-full bg-fuchsia-500" />
                <span className="h-3 w-1 animate-pulse rounded-full bg-violet-400 [animation-delay:120ms]" />
                <span className="h-2 w-1 animate-pulse rounded-full bg-pink-400 [animation-delay:240ms]" />
                <span className="h-4 w-1 animate-pulse rounded-full bg-fuchsia-300 [animation-delay:360ms]" />
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navItem("/", "Home")}
            {navItem("/browse", "Browse")}
            {navItem("/charts", "Charts")}
            {navItem("/artist-profile", "Profile")}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(168,85,247,0.25)] transition hover:scale-[1.02]"
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
            className="hidden rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500/20 md:block"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
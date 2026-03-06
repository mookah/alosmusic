"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveConcert from "@/components/LiveConcert";

export default function Sidebar({ onAuth }: { onAuth: () => void }) {
  const pathname = usePathname();

  const item = (href: string) =>
    `block rounded-xl px-3 py-2.5 text-sm transition ${
      pathname === href
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <aside className="hidden md:block w-[250px] lg:w-[260px] shrink-0 border-r border-white/10 px-4 py-6">
      <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">
        Menu
      </div>

      <div className="space-y-1">
        <Link className={item("/")} href="/">
          Home
        </Link>

        <Link className={item("/browse")} href="/browse">
          Browse
        </Link>

        <Link className={item("/trending")} href="/trending">
          Trending
        </Link>

        <Link className={item("/artists")} href="/artists">
          Artists
        </Link>

        <Link className={item("/playlists")} href="/playlists">
          Playlists
        </Link>

        <Link className={item("/charts")} href="/charts">
          Charts
        </Link>

        <Link className={item("/upload")} href="/upload">
          Upload
        </Link>

        <Link className={item("/artist-profile")} href="/artist-profile">
          My Profile
        </Link>
      </div>

      <div className="mt-6 border-t border-white/10 pt-6">
        <button
          onClick={onAuth}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          Login / Admin
        </button>

        <div className="mt-2 text-[11px] leading-relaxed text-white/40">
          Admins approve uploads before publishing.
        </div>

        <div className="mt-5">
          <LiveConcert />
        </div>
      </div>
    </aside>
  );
}
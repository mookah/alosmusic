"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileSidebar({
  open,
  onClose,
  onAuth,
}: {
  open: boolean;
  onClose: () => void;
  onAuth: () => void;
}) {
  const pathname = usePathname();
  if (!open) return null;

  const item = (href: string) =>
    `block rounded-xl px-3 py-2 text-sm transition ${
      pathname === href
        ? "bg-white/10 text-white"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="fixed inset-0 z-[80] md:hidden">
      {/* backdrop */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
        aria-label="Close menu"
      />

      {/* panel */}
      <aside className="absolute left-0 top-0 bottom-0 w-[82%] max-w-[320px] border-r border-white/10 bg-black/80 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-white/60">Menu</div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1">
          <Link onClick={onClose} className={item("/")} href="/">Home</Link>
          <Link onClick={onClose} className={item("/browse")} href="/browse">Browse</Link>
          <Link onClick={onClose} className={item("/trending")} href="/trending">Trending</Link>
          <Link onClick={onClose} className={item("/artists")} href="/artists">Artists</Link>
          <Link onClick={onClose} className={item("/playlists")} href="/playlists">Playlists</Link>
          <Link onClick={onClose} className={item("/charts")} href="/charts">Charts</Link>
          <Link onClick={onClose} className={item("/upload")} href="/upload">Upload</Link>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              onClose();
              onAuth();
            }}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10 transition"
          >
            Login / Admin
          </button>
        </div>
      </aside>
    </div>
  );
}
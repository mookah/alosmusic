"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-white/10 pt-6 text-white/60">
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <div className="text-sm font-semibold text-white">ALOSMUSIC</div>

          <p className="mt-2 max-w-md text-xs leading-relaxed text-white/50">
            Zambia gospel music streaming platform for discovering, uploading,
            and streaming uplifting gospel music.
          </p>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/35">
              Submit Your Song
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Are you a gospel artist? Upload your music and grow your audience
              on ALOSMUSIC.
            </p>

            <Link
              href="/upload"
              className="mt-3 inline-flex rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-500"
            >
              Upload Music
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <Link href="/" className="block hover:text-white">
              Home
            </Link>
            <Link href="/browse" className="block hover:text-white">
              Browse
            </Link>
            <Link href="/upload" className="block hover:text-white">
              Upload
            </Link>
          </div>

          <div className="space-y-2">
            <Link href="/artists" className="block hover:text-white">
              Artists
            </Link>
            <Link href="/charts" className="block hover:text-white">
              Charts
            </Link>
            <Link href="/artist-profile" className="block hover:text-white">
              Profile
            </Link>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/35 md:text-right">
            Connect
          </div>

          <div className="mt-2 space-y-2 text-sm md:text-right">
            <a href="#" className="block hover:text-white">
              Facebook
            </a>
            <a href="#" className="block hover:text-white">
              YouTube
            </a>
            <a href="#" className="block hover:text-white">
              WhatsApp
            </a>
            <a href="mailto:info@alosmusic.com" className="block hover:text-white">
              info@alosmusic.com
            </a>
          </div>

          <div className="mt-5 text-xs text-white/40 md:text-right">
            <div>© {new Date().getFullYear()} ALOSMUSIC</div>
            <div className="mt-1">Built for Zambia Gospel Artists</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
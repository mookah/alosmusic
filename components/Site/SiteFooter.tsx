import Link from "next/link";
import LogoEqualizer from "@/components/Brand/LogoEqualizer";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-white/10 bg-black/20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10">
        {/* Top row */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <LogoEqualizer size={38} />
              <div>
                <div className="text-base font-semibold text-white">ALOSMUSIC</div>
                <div className="text-xs text-white/55">Gospel • Upload • Stream</div>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/60 max-w-md">
              Discover Zambia Gospel music, upload your songs, and share hope through sound.
              Built for worship, praise, and purpose.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/browse"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                Browse
              </Link>
              <Link
                href="/charts"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                Charts
              </Link>
              <Link
                href="/upload"
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500 transition"
              >
                Upload Song
              </Link>
              <button
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                type="button"
              >
                Get the App
              </button>
            </div>

            {/* Social */}
            <div className="mt-6 flex items-center gap-2">
              <a
                href="#"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                Facebook
              </a>
              <a
                href="#"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                YouTube
              </a>
              <a
                href="#"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="text-sm font-semibold text-white/85">Platform</div>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link className="hover:text-white" href="/browse">Music</Link></li>
              <li><Link className="hover:text-white" href="/artists">Artists</Link></li>
              <li><Link className="hover:text-white" href="/playlists">Playlists</Link></li>
              <li><Link className="hover:text-white" href="/charts">Charts</Link></li>
              <li><Link className="hover:text-white" href="/upload">Upload</Link></li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <div className="text-sm font-semibold text-white/85">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link className="hover:text-white" href="/about">About</Link></li>
              <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-white" href="/support">Support</Link></li>
            </ul>

            <div className="mt-6 text-sm font-semibold text-white/85">Legal</div>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li><Link className="hover:text-white" href="/terms">Terms</Link></li>
              <li><Link className="hover:text-white" href="/privacy">Privacy</Link></li>
              <li><Link className="hover:text-white" href="/copyright">Copyright</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 pt-6">
          <div className="text-xs text-white/50">
            © {year} ALOSMUSIC. All rights reserved.
          </div>
          <div className="text-xs text-white/50">
            Made for Gospel • <span className="text-white/70">Zambia</span>
          </div>
        </div>

        {/* Space so BottomPlayer won't cover footer */}
        <div className="h-24" />
      </div>
    </footer>
  );
}
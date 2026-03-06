import Link from "next/link";
import SiteShell from "@/components/Site/SiteShell";
import HotlistRow from "@/components/songs/HotlistRow";
import { getApprovedSongs, getTrendingSongs } from "@/lib/getSongs";

function SectionHeader({
  title,
  href = "/browse",
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link href={href} className="text-sm text-white/70 hover:text-white">
        View all
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const hotlist = await getApprovedSongs(10);
  const trending = await getTrendingSongs(10);

  return (
    <SiteShell title="" showTitle={false}>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <input
              placeholder="Search artists, songs, albums..."
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
            />
            <div className="text-xs text-white/40">⌘K</div>
          </div>
        </div>

        <button className="hidden md:inline-flex rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10 transition">
          Download
        </button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative p-8 md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
            🎧 Gospel Music Platform
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight">
            Upload & share your music
          </h1>

          <p className="mt-3 text-white/70">
            Discover Zambia gospel sounds, worship moments, and live praise.
          </p>

          <div className="mt-7 flex items-center gap-3">
            <Link
              href="/browse"
              className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold hover:bg-purple-500 transition"
            >
              Browse Music
            </Link>

            <Link
              href="/upload"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition"
            >
              Upload a Song
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-end gap-2">
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="h-2 w-2 rounded-full bg-white/80" />
          </div>
        </div>
      </div>

      <SectionHeader title="Hotlist" />
      <HotlistRow tracks={hotlist} />

      <SectionHeader title="Trending Now" />
      <HotlistRow tracks={trending} />

      <div className="pb-24" />
    </SiteShell>
  );
}
import Link from "next/link";
import SiteShell from "@/components/Site/SiteShell";
import HotlistRow from "@/components/songs/HotlistRow";
import { Track } from "@/lib/playerStore";

const HOTLIST: Track[] = [
  {
    id: "hot-1",
    title: "Nothing without you",
    artist: "Levi Mukanah",
    genre: "Gospel",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "hot-2",
    title: "By His Blood",
    artist: "Levi Mukanah",
    genre: "Afro Gospel",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "hot-3",
    title: "Worship Moment",
    artist: "ALOS Worship",
    genre: "Worship",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "hot-4",
    title: "Praise Flow",
    artist: "ALOS Praise",
    genre: "Praise",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "hot-5",
    title: "Acoustic Hope",
    artist: "ALOS Acoustic",
    genre: "Acoustic",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
  },
];

const TRENDING: Track[] = [
  {
    id: "trend-1",
    title: "Holy Forever",
    artist: "ALOS Worship",
    genre: "Worship",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "trend-2",
    title: "Grace Anthem",
    artist: "Livingstone Voices",
    genre: "Gospel",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "trend-3",
    title: "Revival Fire",
    artist: "Youth Praise",
    genre: "Praise",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "trend-4",
    title: "Lift Him Up",
    artist: "Zambia Gospel Live",
    genre: "Live Worship",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  },
];

const NEW_RELEASES: Track[] = [
  {
    id: "new-1",
    title: "Shout of Victory",
    artist: "ALOS Praise",
    genre: "Praise",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "new-2",
    title: "Mercy Song",
    artist: "Levi Mukanah",
    genre: "Gospel",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "new-3",
    title: "Breath of Heaven",
    artist: "ALOS Worship",
    genre: "Worship",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "new-4",
    title: "Praise Again",
    artist: "Choir Sound",
    genre: "Choir",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=80",
  },
];

const WORSHIP_MOMENTS: Track[] = [
  {
    id: "wm-1",
    title: "Night of Worship",
    artist: "ALOS Live",
    genre: "Live",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wm-2",
    title: "Prayer Atmosphere",
    artist: "Worship House",
    genre: "Prayer",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wm-3",
    title: "Spirit Move",
    artist: "ALOS Worship",
    genre: "Worship",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wm-4",
    title: "Altar Sound",
    artist: "Revival Team",
    genre: "Live Worship",
    audioUrl: "PUT_YOUR_MP3_URL_HERE",
    coverUrl:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80",
  },
];

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

export default function HomePage() {
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
      <HotlistRow tracks={HOTLIST} />

      <SectionHeader title="Trending Now" />
      <HotlistRow tracks={TRENDING} />

      <SectionHeader title="New Releases" />
      <HotlistRow tracks={NEW_RELEASES} />

      <SectionHeader title="Worship Moments" />
      <HotlistRow tracks={WORSHIP_MOMENTS} />

      <div className="pb-24" />
    </SiteShell>
  );
}
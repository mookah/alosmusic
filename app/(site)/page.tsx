"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import SiteShell from "@/components/Site/SiteShell";
import LiveConcert from "@/components/LiveConcert";
import { db } from "@/lib/firebase";

type SongDoc = {
  id: string;
  title?: string;
  artist?: string;
  genre?: string;
  coverURL?: string;
  audioURL?: string;
  streams?: number;
};

type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverUrl?: string;
  audioUrl?: string;
};

type HeroSlide = {
  key: string;
  title: string;
  subtitle: string;
  songs: SongDoc[];
};

export default function HomePage() {
  const [songs, setSongs] = useState<SongDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showLive, setShowLive] = useState(false);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadSongs() {
      try {
        const q = query(
          collection(db, "songs"),
          orderBy("createdAt", "desc"),
          limit(12)
        );

        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as SongDoc[];

        setSongs(list);
      } catch (error) {
        console.error("Failed to load songs:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSongs();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!liveRef.current) return;
      if (!liveRef.current.contains(event.target as Node)) {
        setShowLive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const playableTracks = useMemo<Track[]>(() => {
    return songs
      .filter((song) => !!song.audioURL)
      .map((song) => ({
        id: song.id,
        title: song.title || "Untitled Song",
        artist: song.artist || "Unknown Artist",
        genre: song.genre || "Gospel",
        coverUrl: song.coverURL || "/default-cover.jpg",
        audioUrl: song.audioURL || "",
      }));
  }, [songs]);

  const playableSongs = useMemo(() => {
    return songs.filter((song) => !!song.audioURL);
  }, [songs]);

  const newestSongs = useMemo(() => {
    return playableSongs.slice(0, 4);
  }, [playableSongs]);

  const mostPlayedSongs = useMemo(() => {
    return [...playableSongs]
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 4);
  }, [playableSongs]);

  const worshipSongs = useMemo(() => {
    const filtered = playableSongs.filter((song) =>
      (song.genre || "").toLowerCase().includes("worship")
    );
    return (filtered.length ? filtered : playableSongs).slice(0, 4);
  }, [playableSongs]);

  const gospelSongs = useMemo(() => {
    const filtered = playableSongs.filter((song) =>
      (song.genre || "gospel").toLowerCase().includes("gospel")
    );
    return (filtered.length ? filtered : playableSongs).slice(0, 4);
  }, [playableSongs]);

  const heroSlides = useMemo<HeroSlide[]>(() => {
    return [
      {
        key: "top-gospel",
        title: "Top Gospel",
        subtitle: "Spirit-filled sounds for every moment",
        songs: gospelSongs,
      },
      {
        key: "trending-worship",
        title: "Trending Worship",
        subtitle: "Songs lifting hearts across the platform",
        songs: worshipSongs,
      },
      {
        key: "new-uploads",
        title: "New Uploads",
        subtitle: "Fresh music from Zambia gospel artists",
        songs: newestSongs,
      },
      {
        key: "most-played",
        title: "Most Played",
        subtitle: "The songs listeners are enjoying most",
        songs: mostPlayedSongs,
      },
    ].filter((slide) => slide.songs.length > 0);
  }, [gospelSongs, worshipSongs, newestSongs, mostPlayedSongs]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (activeSlide >= heroSlides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, heroSlides.length]);

  function handlePlay(songId: string) {
    const index = playableTracks.findIndex((track) => track.id === songId);
    if (index === -1) return;

    const track = playableTracks[index];

    if (typeof window !== "undefined") {
      localStorage.setItem("alosmusic_active_song", track.id);
      window.dispatchEvent(new Event("alos:active-song-changed"));

      window.dispatchEvent(
        new CustomEvent("alos:play", {
          detail: {
            id: track.id,
            title: track.title,
            artist: track.artist,
            genre: track.genre,
            coverURL: track.coverUrl || "",
            audioURL: track.audioUrl || "",
            queue: playableTracks.map((item) => ({
              id: item.id,
              title: item.title,
              artist: item.artist,
              genre: item.genre,
              coverURL: item.coverUrl || "",
              audioURL: item.audioUrl || "",
            })),
            startIndex: index,
          },
        })
      );
    }
  }

  const totalArtists = new Set(
    songs.map((song) => (song.artist || "Unknown Artist").trim())
  ).size;

  const currentSlide = heroSlides[activeSlide];

  return (
    <SiteShell title="Home" showTitle={false}>
      <div className="space-y-6 md:space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-pink-600/10 p-5 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_30%)]" />
          <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-[11px] text-fuchsia-300 md:text-xs">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.95)]" />
                  Zambia Gospel Music Streaming
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-fuchsia-500/20 blur-2xl" />
                    <div className="absolute inset-2 animate-pulse rounded-full bg-purple-500/20 blur-xl" />
                    <div className="absolute inset-0 rounded-full border border-fuchsia-400/30 ring-spin" />

                    <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,.28)]">
                      <img
                        src="/logo.png"
                        alt="ALOSMUSIC logo"
                        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="text-lg font-extrabold tracking-[0.28em] text-white sm:text-xl">
                      ALOSMUSIC
                    </div>

                    <div className="mt-2 flex h-6 items-end gap-1">
                      <span className="eq-bar h-2 w-1 rounded-full bg-fuchsia-400" />
                      <span className="eq-bar h-4 w-1 rounded-full bg-purple-400" />
                      <span className="eq-bar h-3 w-1 rounded-full bg-pink-400" />
                      <span className="eq-bar h-5 w-1 rounded-full bg-fuchsia-400" />
                      <span className="eq-bar h-3 w-1 rounded-full bg-purple-400" />
                    </div>
                  </div>
                </div>

                <h1 className="mt-6 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl xl:text-6xl">
                  {currentSlide?.title ||
                    "Discover, upload and stream powerful gospel music"}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                  {currentSlide?.subtitle ||
                    "ALOSMUSIC is your home for gospel, worship and praise. Stream the latest sounds, support artists, and grow a strong Zambia gospel music community."}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/upload"
                    className="inline-flex items-center justify-center rounded-2xl bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                  >
                    Upload Your Song
                  </Link>

                  <Link
                    href="/browse"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Browse Music
                  </Link>
                </div>

                <div ref={liveRef} className="relative mt-6 max-w-md">
                  <button
                    type="button"
                    onClick={() => setShowLive((prev) => !prev)}
                    className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                          Platform
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">
                          LIVE
                          <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.95)]" />
                        </div>

                        <p className="mt-2 text-sm leading-6 text-white/60">
                          Stream music, live sessions and artist moments in one place.
                        </p>
                      </div>

                      <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/75">
                        Open
                      </div>
                    </div>
                  </button>

                  <div
                    className={`absolute left-0 top-full z-30 mt-3 w-[220px] origin-top-left transition-all duration-200 ${
                      showLive
                        ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                        : "pointer-events-none -translate-y-1 scale-95 opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/85 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                      <LiveConcert />
                    </div>
                  </div>
                </div>

                {heroSlides.length > 1 && (
                  <div className="mt-6 flex items-center gap-2">
                    {heroSlides.map((slide, index) => (
                      <button
                        key={slide.key}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          activeSlide === index
                            ? "w-8 bg-fuchsia-500"
                            : "w-2.5 bg-white/25 hover:bg-white/40"
                        }`}
                        aria-label={`Go to ${slide.title}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[54%]">
                {currentSlide?.songs?.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {currentSlide.songs.map((song) => (
                      <div
                        key={song.id}
                        className="group overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl transition hover:border-fuchsia-500/30"
                      >
                        <div className="relative">
                          <img
                            src={song.coverURL || "/default-cover.jpg"}
                            alt={song.title || "Song cover"}
                            className="h-48 w-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {song.audioURL && (
                            <button
                              type="button"
                              onClick={() => handlePlay(song.id)}
                              className="absolute bottom-3 right-3 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-fuchsia-600"
                            >
                              ▶ Play
                            </button>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="truncate text-lg font-semibold text-white">
                            {song.title || "Untitled Song"}
                          </div>

                          <div className="mt-1 truncate text-sm text-white/60">
                            {song.artist || "Unknown Artist"}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="truncate rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                              {song.genre || "Gospel"}
                            </span>

                            <span className="shrink-0 text-xs text-white/40">
                              {typeof song.streams === "number"
                                ? `${song.streams} streams`
                                : "New"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-white/60">
                    No playable songs yet. Upload songs with audio to power the
                    hero slider.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">
              Songs
            </div>
            <div className="mt-3 text-3xl font-bold text-white">
              {songs.length}
            </div>
            <div className="mt-1 text-sm text-white/55">
              Latest uploaded tracks
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">
              Artists
            </div>
            <div className="mt-3 text-3xl font-bold text-white">
              {totalArtists}
            </div>
            <div className="mt-1 text-sm text-white/55">
              Artists represented here
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:col-span-2 xl:col-span-1">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">
              Platform
            </div>
            <div className="mt-3 flex items-center gap-2 text-3xl font-bold text-white">
              LIVE
              <span className="h-3 w-3 animate-pulse rounded-full bg-fuchsia-400 shadow-[0_0_14px_rgba(217,70,239,0.95)]" />
            </div>
            <div className="mt-1 text-sm text-white/55">
              Upload, stream and grow
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Latest Uploads</h2>
              <p className="mt-1 text-sm text-white/55">
                Fresh gospel sounds from your platform
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white/60">
              Loading songs...
            </div>
          ) : songs.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white/60">
              No songs uploaded yet. Your first upload will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-fuchsia-500/30 hover:bg-white/[0.05]"
                >
                  <div className="relative">
                    <img
                      src={song.coverURL || "/default-cover.jpg"}
                      alt={song.title || "Song cover"}
                      className="h-40 w-full object-cover sm:h-52"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />

                    {song.audioURL ? (
                      <button
                        type="button"
                        onClick={() => handlePlay(song.id)}
                        className="absolute bottom-3 right-3 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-fuchsia-600"
                      >
                        ▶ Play
                      </button>
                    ) : (
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white/70 backdrop-blur">
                        No Audio
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="truncate text-base font-semibold text-white md:text-lg">
                      {song.title || "Untitled Song"}
                    </div>

                    <div className="mt-1 truncate text-sm text-white/60">
                      {song.artist || "Unknown Artist"}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="truncate rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
                        {song.genre || "Gospel"}
                      </span>

                      <span className="shrink-0 text-xs text-white/40">
                        {typeof song.streams === "number"
                          ? `${song.streams} streams`
                          : "New"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
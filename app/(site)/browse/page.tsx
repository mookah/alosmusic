"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import SiteShell from "@/components/Site/SiteShell";
import { db } from "@/lib/firebase";

type SongDoc = {
  id: string;
  title?: string;
  artist?: string;
  genre?: string;
  coverURL?: string;
  coverUrl?: string;
  audioURL?: string;
  audioUrl?: string;
  streams?: number;
  createdAt?: any;
};

type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverURL?: string;
  audioURL?: string;
};

const GENRES = [
  "All",
  "Gospel",
  "Worship",
  "Praise",
  "Afro Gospel",
  "Acoustic",
  "Choir",
];

function normalizeTrack(song: SongDoc): PlayerTrack {
  return {
    id: song.id,
    title: song.title || "Untitled",
    artist: song.artist || "Unknown Artist",
    genre: song.genre || "Gospel",
    coverURL: song.coverURL || song.coverUrl || "",
    audioURL: song.audioURL || song.audioUrl || "",
  };
}

function formatCount(num: number) {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function SongMenu({
  onShare,
  onDownload,
}: {
  onShare: () => void;
  onDownload: () => void;
}) {
  return (
    <details className="relative">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 transition hover:bg-white/[0.10]">
        <span className="text-lg leading-none">⋮</span>
      </summary>

      <div className="absolute right-0 top-12 z-30 min-w-[160px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShare();
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
        >
          <span>↗</span>
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDownload();
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/[0.06]"
        >
          <span>↓</span>
          <span>Download</span>
        </button>
      </div>
    </details>
  );
}

export default function BrowsePage() {
  const [songs, setSongs] = useState<SongDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [error, setError] = useState("");
  const [activeSongId, setActiveSongId] = useState("");

  useEffect(() => {
    async function loadSongs() {
      try {
        setLoading(true);
        setError("");

        const q = query(collection(db, "songs"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const list = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as SongDoc[];

        setSongs(list);
      } catch (err) {
        console.error("Failed to load songs:", err);
        setError("Could not load songs right now.");
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }

    loadSongs();
  }, []);

  useEffect(() => {
    function syncActiveSong() {
      if (typeof window === "undefined") return;
      const current = localStorage.getItem("alosmusic_active_song") || "";
      setActiveSongId(current);
    }

    syncActiveSong();
    window.addEventListener("alos:active-song-changed", syncActiveSong);

    return () => {
      window.removeEventListener("alos:active-song-changed", syncActiveSong);
    };
  }, []);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesGenre =
        activeGenre === "All" ||
        (song.genre || "").toLowerCase() === activeGenre.toLowerCase();

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (song.title || "").toLowerCase().includes(q) ||
        (song.artist || "").toLowerCase().includes(q) ||
        (song.genre || "").toLowerCase().includes(q);

      return matchesGenre && matchesSearch;
    });
  }, [songs, search, activeGenre]);

  const featuredSong = filteredSongs[0] || songs[0] || null;

  const trendingSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 5);
  }, [songs]);

  function handlePlay(song: SongDoc, queueSource: SongDoc[], index: number) {
    const audioSrc = song.audioURL || song.audioUrl || "";
    const coverSrc = song.coverURL || song.coverUrl || "";

    if (!audioSrc) {
      alert("This song has no audio file yet.");
      return;
    }

    const queue = queueSource
      .filter((item) => item.audioURL || item.audioUrl)
      .map(normalizeTrack);

    const startIndex = queue.findIndex((item) => item.id === song.id);
    const safeStartIndex = startIndex >= 0 ? startIndex : index;

    if (typeof window !== "undefined") {
      localStorage.setItem("alosmusic_active_song", song.id);
      window.dispatchEvent(new Event("alos:active-song-changed"));
    }

    setActiveSongId(song.id);

    window.dispatchEvent(
      new CustomEvent("alos:play", {
        detail: {
          id: song.id,
          title: song.title || "Untitled",
          artist: song.artist || "Unknown Artist",
          genre: song.genre || "Gospel",
          coverURL: coverSrc,
          audioURL: audioSrc,
          queue,
          startIndex: safeStartIndex,
        },
      })
    );
  }

  async function handleShareSong(song: SongDoc) {
    const title = song.title || "Untitled Song";
    const artist = song.artist || "Unknown Artist";
    const text = `${title} by ${artist}`;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/browse?song=${song.id}`
        : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} on ALOSMUSIC`,
          text: `Listen to ${text} on ALOSMUSIC`,
          url,
        });
      } else if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        alert("Song link copied.");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  }

  function handleDownloadSong(song: SongDoc) {
    const audioSrc = song.audioURL || song.audioUrl || "";

    if (!audioSrc) {
      alert("This song has no downloadable audio yet.");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = audioSrc;
      link.download = `${song.title || "song"}.mp3`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download could not start.");
    }
  }

  return (
    <SiteShell title="Browse">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black px-6 py-8 md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.20),transparent_30%),radial-gradient(circle_at_right,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.10),transparent_26%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                Browse Library
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                Find your next
                <br />
                favorite sound
              </h1>

              <p className="mt-4 text-base text-white/65 md:text-lg">
                Explore worship, praise, Afro gospel, and uplifting music from
                your growing ALOSMusic library.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                <input
                  type="text"
                  placeholder="Search by song title, artist, or genre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-xl bg-transparent px-4 text-white outline-none placeholder:text-white/35"
                />
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-3">
            {GENRES.map((genre) => {
              const active = activeGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setActiveGenre(genre)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white"
                      : "border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                  Songs
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  Browse tracks
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
                {filteredSongs.length} result{filteredSongs.length === 1 ? "" : "s"}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-3"
                  >
                    <div className="h-16 w-16 animate-pulse rounded-2xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-1/3 animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-1/4 animate-pulse rounded bg-white/10" />
                    </div>
                    <div className="h-10 w-20 animate-pulse rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-white">
                <p className="font-semibold">Could not load songs</p>
                <p className="mt-2 text-sm text-white/70">{error}</p>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
                <h3 className="text-2xl font-bold text-white">No songs found</h3>
                <p className="mt-2 text-white/60">
                  Try a different song title, artist, or genre.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSongs.map((song, index) => {
                  const isCurrentSong = activeSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`group flex items-center gap-4 rounded-[24px] border p-3 transition ${
                        isCurrentSong
                          ? "border-fuchsia-500/60 bg-white/[0.05] ring-1 ring-fuchsia-400/30"
                          : "border-white/10 bg-black/30 hover:border-fuchsia-500/30 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
                        {song.coverURL || song.coverUrl ? (
                          <img
                            src={song.coverURL || song.coverUrl}
                            alt={song.title || "Song cover"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-white/20">♪</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-semibold text-white">
                          {song.title || "Untitled"}
                        </p>
                        <p className="truncate text-sm text-white/60">
                          {song.artist || "Unknown Artist"} • {song.genre || "Gospel"}
                        </p>
                      </div>

                      <div className="hidden text-sm text-white/45 md:block">
                        {formatCount(Number(song.streams || 0))} plays
                      </div>

                      <div className="flex items-center gap-2">
                        <SongMenu
                          onShare={() => handleShareSong(song)}
                          onDownload={() => handleDownloadSong(song)}
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlay(song, filteredSongs, index);
                          }}
                          className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                        >
                          {isCurrentSong ? "Playing" : "Play"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]">
              <div className="relative h-72 overflow-hidden">
                {featuredSong?.coverURL || featuredSong?.coverUrl ? (
                  <img
                    src={featuredSong.coverURL || featuredSong.coverUrl}
                    alt={featuredSong.title || "Featured song"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-fuchsia-600/20 via-violet-500/10 to-blue-500/10 text-7xl text-white/15">
                    ♪
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>

              <div className="p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                  Featured Pick
                </p>

                <h3 className="mt-3 text-3xl font-black text-white">
                  {featuredSong?.title || "No featured song"}
                </h3>

                <p className="mt-2 text-white/65">
                  {featuredSong?.artist || "Unknown Artist"} •{" "}
                  {featuredSong?.genre || "Gospel"}
                </p>

                <p className="mt-4 text-sm text-white/45">
                  {formatCount(Number(featuredSong?.streams || 0))} total plays
                </p>

                {featuredSong ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePlay(
                          featuredSong,
                          filteredSongs.length ? filteredSongs : songs,
                          0
                        );
                      }}
                      className="rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-6 py-3 text-sm font-bold text-white"
                    >
                      Play now
                    </button>

                    <SongMenu
                      onShare={() => handleShareSong(featuredSong)}
                      onDownload={() => handleDownloadSong(featuredSong)}
                    />

                    <Link
                      href="/upload"
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                    >
                      Upload song
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5">
                <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                  Top Plays
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Trending songs
                </h3>
              </div>

              <div className="space-y-4">
                {trendingSongs.length ? (
                  trendingSongs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-sm font-bold text-white/75">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">
                          {song.title || "Untitled"}
                        </p>
                        <p className="truncate text-sm text-white/55">
                          {song.artist || "Unknown Artist"}
                        </p>
                      </div>

                      <span className="text-sm text-white/45">
                        {formatCount(Number(song.streams || 0))}
                      </span>

                      <div className="flex items-center gap-2">
                        <SongMenu
                          onShare={() => handleShareSong(song)}
                          onDownload={() => handleDownloadSong(song)}
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePlay(song, trendingSongs, index);
                          }}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/55">No trending songs yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
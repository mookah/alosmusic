"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SiteShell from "@/components/Site/SiteShell";

type Song = {
  id: string;
  title?: string;
  artist?: string;
  genre?: string;
  coverURL?: string;
  coverUrl?: string;
  audioURL?: string;
  audioUrl?: string;
  streams?: number;
};

type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverURL?: string;
  audioURL?: string;
};

function formatPlays(num: number) {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

export default function ChartsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSongId, setActiveSongId] = useState("");

  useEffect(() => {
    async function loadCharts() {
      try {
        const snap = await getDocs(collection(db, "songs"));

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Song[];

        list.sort((a, b) => (b.streams || 0) - (a.streams || 0));
        setSongs(list.slice(0, 50));
      } catch (err) {
        console.error("Failed to load charts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCharts();
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

  function normalize(song: Song): PlayerTrack {
    return {
      id: song.id,
      title: song.title || "Untitled",
      artist: song.artist || "Unknown Artist",
      genre: song.genre || "Gospel",
      coverURL: song.coverURL || song.coverUrl || "",
      audioURL: song.audioURL || song.audioUrl || "",
    };
  }

  function playSong(song: Song, index: number) {
    const audioSrc = song.audioURL || song.audioUrl || "";
    const coverSrc = song.coverURL || song.coverUrl || "";

    if (!audioSrc) {
      alert("This song has no audio file yet.");
      return;
    }

    const playableSongs = songs.filter((item) => item.audioURL || item.audioUrl);
    const queue = playableSongs.map(normalize);

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

  const topThree = useMemo(() => songs.slice(0, 3), [songs]);
  const rest = useMemo(() => songs.slice(3), [songs]);

  if (loading) {
    return (
      <SiteShell title="Charts">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-white/70">
            Loading charts...
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title="Charts">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black px-6 py-8 md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_26%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_30%)]" />
          <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-1 text-xs uppercase tracking-[0.28em] text-fuchsia-200">
              Weekly Ranking
            </div>

            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  Premium Gospel
                  <br />
                  Charts
                </h1>

                <p className="mt-4 text-base leading-7 text-white/65 md:text-lg">
                  The most streamed gospel songs on ALOSMUSIC right now.
                  Discover what listeners are playing most across the platform.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Ranked Songs
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {songs.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    #1 Streams
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    {songs[0] ? formatPlays(Number(songs[0].streams || 0)) : "0"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-1 col-span-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Platform Mood
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">
                    LIVE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {topThree.length > 0 && (
          <section>
            <div className="mb-5">
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                Spotlight
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Top 3 this week
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {topThree.map((song, index) => {
                const isCurrentSong = activeSongId === song.id;
                const rank = index + 1;
                const cover = song.coverURL || song.coverUrl || "/default-cover.jpg";

                return (
                  <div
                    key={song.id}
                    className={`group relative overflow-hidden rounded-[28px] border transition duration-300 ${
                      isCurrentSong
                        ? "border-fuchsia-500/70 bg-white/[0.06] shadow-[0_0_40px_rgba(217,70,239,0.20)] ring-1 ring-fuchsia-400/35"
                        : "border-white/10 bg-white/[0.03] hover:border-fuchsia-500/30 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="relative h-72 overflow-hidden">
                      <img
                        src={cover}
                        alt={song.title || "Song cover"}
                        className={`h-full w-full object-cover transition duration-700 ${
                          isCurrentSong ? "scale-105" : "group-hover:scale-105"
                        }`}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-black shadow-lg ${
                            rank === 1
                              ? "bg-yellow-400 text-black"
                              : rank === 2
                              ? "bg-white text-black"
                              : "bg-orange-500 text-white"
                          }`}
                        >
                          #{rank}
                        </div>

                        {isCurrentSong && (
                          <div className="rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-semibold text-white">
                            Playing
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          playSong(song, index);
                        }}
                        className="absolute bottom-4 right-4 rounded-full bg-black/70 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-fuchsia-600"
                      >
                        {isCurrentSong ? "Playing" : "▶ Play"}
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="truncate text-2xl font-black text-white">
                        {song.title || "Untitled"}
                      </div>

                      <div className="mt-2 truncate text-sm text-white/65">
                        {song.artist || "Unknown Artist"} • {song.genre || "Gospel"}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                          Premium Chart Pick
                        </span>

                        <span className="text-sm font-medium text-white/55">
                          {formatPlays(Number(song.streams || 0))} plays
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-[30px] border border-white/10 bg-white/[0.03] p-4 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                Full Ranking
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Top 50 Songs
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
              Updated live
            </span>
          </div>

          {songs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-white/60">
              No chart songs available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song, index) => {
                const isCurrentSong = activeSongId === song.id;
                const cover = song.coverURL || song.coverUrl || "/default-cover.jpg";
                const rank = index + 1;

                return (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 rounded-[22px] border p-3 transition md:gap-4 ${
                      isCurrentSong
                        ? "border-fuchsia-500/60 bg-white/[0.06] ring-1 ring-fuchsia-400/30"
                        : "border-white/10 bg-black/25 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex w-10 shrink-0 items-center justify-center text-lg font-black text-white/70 md:w-14 md:text-xl">
                      {rank}
                    </div>

                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white/10 md:h-16 md:w-16">
                      <img
                        src={cover}
                        alt={song.title || "Song cover"}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white md:text-base">
                        {song.title || "Untitled"}
                      </div>
                      <div className="mt-1 truncate text-xs text-white/60 md:text-sm">
                        {song.artist || "Unknown Artist"} • {song.genre || "Gospel"}
                      </div>
                    </div>

                    <div className="hidden min-w-[90px] text-right text-sm text-white/50 md:block">
                      {formatPlays(Number(song.streams || 0))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playSong(song, index);
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition md:px-5 md:text-sm ${
                        isCurrentSong
                          ? "bg-fuchsia-500 text-white"
                          : "border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.10]"
                      }`}
                    >
                      {isCurrentSong ? "Playing" : "Play"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
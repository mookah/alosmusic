"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SiteShell from "@/components/Site/SiteShell";
import { fetchLatestSongs, type SongDoc } from "@/lib/fetchLatestSongs";
import { incrementSongPlays } from "@/lib/incrementSongPlays";

export default function SongsPage() {
  const [songs, setSongs] = useState<SongDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSong, setCurrentSong] = useState<SongDoc | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadSongs() {
      try {
        setLoading(true);
        setError("");

        const items = await fetchLatestSongs(60);
        setSongs(items);

        if (items.length > 0) {
          setCurrentSong(items[0]);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load songs.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadSongs();
  }, []);

  const filteredSongs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return songs;

    return songs.filter((song) => {
      return (
        song.title?.toLowerCase().includes(q) ||
        song.artist?.toLowerCase().includes(q) ||
        song.genre?.toLowerCase().includes(q) ||
        song.country?.toLowerCase().includes(q)
      );
    });
  }, [songs, search]);

  function handleSongSelect(song: SongDoc) {
    setCurrentSong(song);
  }

  function handlePlayCounted(songId: string) {
    setSongs((prev) =>
      prev.map((song) =>
        song.id === songId ? { ...song, plays: (song.plays ?? 0) + 1 } : song
      )
    );

    setCurrentSong((prev) =>
      prev && prev.id === songId
        ? { ...prev, plays: (prev.plays ?? 0) + 1 }
        : prev
    );
  }

  return (
    <SiteShell title="Songs">
      <div className="space-y-8 pb-32">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black px-6 py-8 md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.20),transparent_30%),radial-gradient(circle_at_right,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.10),transparent_26%)]" />

          <div className="relative">
            <div className="mb-4 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
              Live Music Feed
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Stream uploaded
              <br />
              gospel music
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/65 md:text-lg">
              Browse the latest uploads, discover artists, and play songs instantly.
            </p>

            <div className="mt-6">
              <input
                type="text"
                placeholder="Search by title, artist, genre, or country"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                Library
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Latest songs
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
              {filteredSongs.length} songs
            </span>
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/70">
              Loading songs...
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && filteredSongs.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/70">
              No songs found.
            </div>
          )}

          {!loading && !error && filteredSongs.length > 0 && (
            <div className="grid gap-4">
              {filteredSongs.map((song, index) => {
                const active = currentSong?.id === song.id;

                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => handleSongSelect(song)}
                    className={`grid w-full grid-cols-[64px_1fr_auto] items-center gap-4 rounded-3xl border p-3 text-left transition ${
                      active
                        ? "border-fuchsia-500/40 bg-fuchsia-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white/5">
                      {song.coverUrl ? (
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholders/default.jpg";
                          }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/20 to-indigo-500/25" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="truncate text-base font-semibold text-white">
                          {song.title}
                        </h3>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-white/60">
                        <span>{song.artist || "Unknown artist"}</span>
                        {song.genre && <span>• {song.genre}</span>}
                        {song.country && <span>• {song.country}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 md:inline-flex">
                        {song.plays ?? 0} plays
                      </span>

                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-600 text-white shadow-lg">
                        ▶
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <PlayerBar song={currentSong} onPlayCounted={handlePlayCounted} />
    </SiteShell>
  );
}

function PlayerBar({
  song,
  onPlayCounted,
}: {
  song: SongDoc | null;
  onPlayCounted: (songId: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countedRef = useRef<string | null>(null);

  useEffect(() => {
    countedRef.current = null;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const audio = audioRef.current;
    if (!audio || !song?.audioUrl) return;

    audio.pause();
    audio.src = song.audioUrl;
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio play failed:", error);
      });
    }
  }, [song?.id, song?.audioUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handlePlay() {
    if (!song?.id) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      if (!song?.id) return;
      if (countedRef.current === song.id) return;

      countedRef.current = song.id;
      await incrementSongPlays(song.id);
      onPlayCounted(song.id);
    }, 10000);
  }

  function handlePause() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white/5">
          {song.coverUrl ? (
            <img
              src={song.coverUrl}
              alt={song.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholders/default.jpg";
              }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/20 to-indigo-500/25" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">
            {song.title}
          </div>
          <div className="truncate text-xs text-white/60">
            {song.artist || "Unknown artist"}
            {song.genre ? ` • ${song.genre}` : ""}
            {song.country ? ` • ${song.country}` : ""}
            {typeof song.plays === "number" ? ` • ${song.plays} plays` : ""}
          </div>
        </div>

        <div className="w-full max-w-xl">
          <audio
            ref={audioRef}
            controls
            onPlay={handlePlay}
            onPause={handlePause}
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
}
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
  country?: string;
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

type CountryChart = {
  slug: string;
  title: string;
  subtitle: string;
  country: string;
  cover: string;
  songs: Song[];
};

const DEFAULT_COUNTRIES = [
  "Zambia",
  "Nigeria",
  "Zimbabwe",
  "Ghana",
  "South Africa",
  "Kenya",
  "Tanzania",
  "Global",
];

function formatPlays(num: number) {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function slugifyCountry(country: string) {
  return country.toLowerCase().replace(/\s+/g, "-");
}

function normalizeCountry(input?: string) {
  const value = (input || "").trim().toLowerCase();

  if (!value) return "Global";

  if (["zambia", "zambian"].includes(value)) return "Zambia";
  if (["nigeria", "nigerian"].includes(value)) return "Nigeria";
  if (["zimbabwe", "zimbambwe", "zimbabwean", "zim"].includes(value)) {
    return "Zimbabwe";
  }
  if (["ghana", "ghanaian"].includes(value)) return "Ghana";
  if (["south africa", "south african", "sa"].includes(value)) {
    return "South Africa";
  }
  if (["kenya", "kenyan"].includes(value)) return "Kenya";
  if (["tanzania", "tanzanian"].includes(value)) return "Tanzania";
  if (["global", "worldwide", "international"].includes(value)) {
    return "Global";
  }

  return "Global";
}

function getCountryFlag(country: string) {
  const flags: Record<string, string> = {
    Zambia: "🇿🇲",
    Nigeria: "🇳🇬",
    Zimbabwe: "🇿🇼",
    Ghana: "🇬🇭",
    "South Africa": "🇿🇦",
    Kenya: "🇰🇪",
    Tanzania: "🇹🇿",
    Global: "🌍",
  };

  return flags[country] || "🌍";
}

function getCountryCover(country: string, songs: Song[]) {
  const firstWithCover = songs.find((song) => song.coverURL || song.coverUrl);
  return firstWithCover?.coverURL || firstWithCover?.coverUrl || "/default-cover.jpg";
}

function getCountryAccent(country: string) {
  const map: Record<string, string> = {
    Zambia: "from-emerald-500/30 via-green-500/10 to-black",
    Nigeria: "from-sky-500/30 via-cyan-500/10 to-black",
    Zimbabwe: "from-orange-500/30 via-red-500/10 to-black",
    Ghana: "from-purple-500/30 via-fuchsia-500/10 to-black",
    "South Africa": "from-teal-500/30 via-emerald-500/10 to-black",
    Kenya: "from-red-500/30 via-emerald-500/10 to-black",
    Tanzania: "from-cyan-500/30 via-blue-500/10 to-black",
    Global: "from-yellow-500/30 via-orange-500/10 to-black",
  };

  return map[country] || "from-fuchsia-500/30 via-purple-500/10 to-black";
}

export default function ChartsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSongId, setActiveSongId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Zambia");

  useEffect(() => {
    async function loadCharts() {
      try {
        const snap = await getDocs(collection(db, "songs"));

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Song[];

        list.sort((a, b) => (b.streams || 0) - (a.streams || 0));
        setSongs(list);
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

  function playSong(song: Song, queueSource: Song[], index: number) {
    const audioSrc = song.audioURL || song.audioUrl || "";
    const coverSrc = song.coverURL || song.coverUrl || "";

    if (!audioSrc) {
      alert("This song has no audio file yet.");
      return;
    }

    const playableSongs = queueSource.filter((item) => item.audioURL || item.audioUrl);
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

  const countryCharts = useMemo<CountryChart[]>(() => {
    return DEFAULT_COUNTRIES.map((country) => {
      let countrySongs: Song[];

      if (country === "Global") {
        countrySongs = [...songs].sort((a, b) => (b.streams || 0) - (a.streams || 0));
      } else {
        countrySongs = songs
          .filter((song) => normalizeCountry(song.country) === country)
          .sort((a, b) => (b.streams || 0) - (a.streams || 0));
      }

      return {
        slug: slugifyCountry(country),
        title: `Top Songs ${country}`,
        subtitle: "Your weekly update",
        country,
        cover: getCountryCover(country, countrySongs),
        songs: countrySongs.slice(0, 50),
      };
    });
  }, [songs]);

  useEffect(() => {
    const exists = countryCharts.some((chart) => chart.country === selectedCountry);
    if (!exists && countryCharts.length > 0) {
      setSelectedCountry(countryCharts[0].country);
    }
  }, [countryCharts, selectedCountry]);

  const activeChart = useMemo(() => {
    return (
      countryCharts.find((chart) => chart.country === selectedCountry) ||
      countryCharts[0] ||
      null
    );
  }, [countryCharts, selectedCountry]);

  const topThree = useMemo(() => activeChart?.songs.slice(0, 3) || [], [activeChart]);
  const rankedSongs = useMemo(() => activeChart?.songs || [], [activeChart]);

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
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black px-5 py-7 md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_26%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_30%)]" />
          <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-fuchsia-200">
              Weekly Ranking
            </div>

            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                  Country Gospel
                  <br />
                  Charts
                </h1>

                <p className="mt-4 text-sm leading-7 text-white/65 md:text-lg">
                  Explore the most streamed gospel songs by country. New uploads
                  automatically appear under their saved country.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 md:text-xs">
                    Countries
                  </div>
                  <div className="mt-2 text-xl font-bold text-white md:text-2xl">
                    {countryCharts.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 md:text-xs">
                    Selected
                  </div>
                  <div className="mt-2 truncate text-xl font-bold text-white md:text-2xl">
                    {activeChart
                      ? `${getCountryFlag(activeChart.country)} ${activeChart.country}`
                      : "—"}
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 md:text-xs">
                    #1 Streams
                  </div>
                  <div className="mt-2 text-xl font-bold text-white md:text-2xl">
                    {activeChart?.songs[0]
                      ? formatPlays(Number(activeChart.songs[0].streams || 0))
                      : "0"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                Browse
              </p>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                Charts by country
              </h2>
            </div>

            <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 md:inline-flex">
              Swipe on mobile
            </span>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              {countryCharts.map((chart) => {
                const isActive = activeChart?.country === chart.country;

                return (
                  <button
                    key={chart.slug}
                    type="button"
                    onClick={() => setSelectedCountry(chart.country)}
                    className={`group relative w-[240px] shrink-0 overflow-hidden rounded-[28px] border text-left transition md:w-auto ${
                      isActive
                        ? "border-fuchsia-500/60 bg-white/[0.06] ring-1 ring-fuchsia-400/30"
                        : "border-white/10 bg-white/[0.03] hover:border-fuchsia-500/30 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="relative h-56">
                      <img
                        src={chart.cover}
                        alt={chart.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${getCountryAccent(
                          chart.country
                        )}`}
                      />
                      <div className="absolute inset-0 bg-black/25" />

                      <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
                        {chart.songs.length > 0
                          ? `${chart.songs.length} songs`
                          : "No songs yet"}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="text-3xl font-black leading-none text-white">
                          Top Songs
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-2xl font-black text-white/95">
                          <span>{getCountryFlag(chart.country)}</span>
                          <span>{chart.country}</span>
                        </div>

                        <div className="mt-3 text-sm text-white/70">
                          {chart.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {activeChart && topThree.length > 0 && (
          <section>
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                  Spotlight
                </p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  Top 3 in {getCountryFlag(activeChart.country)} {activeChart.country}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  const firstSong = activeChart.songs[0];
                  if (!firstSong) return;
                  playSong(firstSong, activeChart.songs, 0);
                }}
                className="inline-flex items-center justify-center rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
              >
                ▶ Play {getCountryFlag(activeChart.country)} {activeChart.country} Chart
              </button>
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
                          playSong(song, activeChart.songs, index);
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
                          {getCountryFlag(activeChart.country)} {activeChart.country} Chart Pick
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
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                Full Ranking
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Top Songs{" "}
                {activeChart
                  ? `${getCountryFlag(activeChart.country)} ${activeChart.country}`
                  : ""}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {countryCharts.map((chart) => {
                const active = chart.country === selectedCountry;

                return (
                  <button
                    key={chart.slug}
                    type="button"
                    onClick={() => setSelectedCountry(chart.country)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-fuchsia-600 text-white"
                        : "border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{getCountryFlag(chart.country)}</span>
                      <span>{chart.country}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {rankedSongs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-white/60">
              No songs in {activeChart ? `${getCountryFlag(activeChart.country)} ${activeChart.country}` : "this country"} yet.
            </div>
          ) : (
            <div className="space-y-3">
              {rankedSongs.map((song, index) => {
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
                        playSong(song, rankedSongs, index);
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
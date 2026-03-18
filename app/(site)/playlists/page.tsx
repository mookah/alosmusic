"use client";

import Link from "next/link";
import SiteShell from "@/components/Site/SiteShell";
import { PLAYLISTS } from "@/components/Site/mockData";

const GENRES = [
  "Gospel",
  "Worship",
  "Praise",
  "Choir",
  "Afro Gospel",
  "Prayer",
];

function getPlaylistHref(title: string) {
  const t = title.toLowerCase();

  if (t.includes("top gospel songs")) return "/charts";
  if (t.includes("worship")) return "/browse";
  if (t.includes("focus")) return "/browse";
  if (t.includes("praise")) return "/browse";
  if (t.includes("gospel")) return "/browse";

  return "/browse";
}

function getPlaylistTag(title: string) {
  const t = title.toLowerCase();

  if (t.includes("top gospel songs")) return "Charts";
  if (t.includes("worship")) return "Worship";
  if (t.includes("focus")) return "Artist Focus";
  if (t.includes("praise")) return "Praise Mix";
  if (t.includes("gospel")) return "Gospel";

  return "Collection";
}

export default function PlaylistsPage() {
  return (
    <SiteShell title="Playlists">
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black px-6 py-8 md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.20),transparent_30%),radial-gradient(circle_at_right,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.10),transparent_26%)]" />

          <div className="relative">
            <div className="mb-4 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-fuchsia-200">
              Curated Gospel Collections
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Playlists for worship,
              <br />
              praise and prayer
            </h1>

            <p className="mt-4 max-w-2xl text-base text-white/65 md:text-lg">
              Discover handpicked gospel collections, worship selections,
              artist-focused mixes, and uplifting songs across ALOSMUSIC.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <Chip key={g} label={g} />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-300/70">
                Collections
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Featured playlists
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
              {PLAYLISTS.length} playlists
            </span>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {PLAYLISTS.map((p) => {
              const href = getPlaylistHref(p.title);
              const tag = getPlaylistTag(p.title);

              return (
                <Link key={p.title} href={href} className="group block">
                  <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] transition duration-300 hover:border-fuchsia-500/30 hover:bg-white/[0.05] hover:shadow-[0_0_30px_rgba(217,70,239,0.12)]">
                    <div className="relative aspect-square overflow-hidden bg-white/5">
                      {p.img ? (
                        <img
                          src={p.img}
                          alt={p.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholders/default.jpg";
                          }}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/20 to-indigo-500/25" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                        {tag}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="line-clamp-2 text-sm font-semibold text-white">
                            {p.title}
                          </div>
                          <div className="mt-1 text-xs text-white/70">
                            ▶ {p.plays}
                          </div>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-white shadow-lg transition group-hover:scale-105 group-hover:bg-fuchsia-500">
                          ▶
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="line-clamp-2 font-medium text-white/90 group-hover:text-white">
                        {p.title}
                      </div>
                      <div className="mt-2 text-xs text-white/55">
                        Open collection
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
    >
      {label}
    </button>
  );
}
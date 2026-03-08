"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteShell from "@/components/Site/SiteShell";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Artist = {
  uid: string;
  stageName?: string;
  fullName?: string;
  genre?: string;
  photoURL?: string;
  bio?: string;
};

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadArtists() {
      try {
        const q = query(collection(db, "artists"), orderBy("stageName"));
        const snap = await getDocs(q);

        const list = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<Artist, "uid">;
          return {
            uid: docSnap.id,
            ...data,
          };
        });

        setArtists(list);
      } catch (error) {
        console.error("Failed to load artists:", error);
      } finally {
        setLoading(false);
      }
    }

    loadArtists();
  }, []);

  const filteredArtists = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return artists;

    return artists.filter((artist) => {
      const name = artist.stageName || artist.fullName || "";
      const genre = artist.genre || "";
      return (
        name.toLowerCase().includes(q) || genre.toLowerCase().includes(q)
      );
    });
  }, [artists, search]);

  return (
    <SiteShell title="Artists">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(168,85,247,0.14),rgba(0,0,0,0.2),rgba(59,130,246,0.10))] p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-purple-200">
                Featured Artists
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Discover artists on ALOSMUSIC
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 md:text-base">
                Explore real artist profiles from your platform with a cleaner,
                richer premium look.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search artists or genre..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-white/35 focus:border-purple-400/40 focus:bg-black/55"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 md:p-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[26px] border border-white/10 bg-black/30"
                >
                  <div className="aspect-square animate-pulse bg-white/5" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-black/30 p-10 text-center">
              <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-2xl">
                🎤
              </div>
              <h2 className="text-lg font-semibold">No artists found</h2>
              <p className="mt-2 text-sm text-white/60">
                Try another search or create a new artist profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredArtists.map((artist) => {
                const displayName =
                  artist.stageName || artist.fullName || "Unnamed Artist";

                return (
                  <Link
                    key={artist.uid}
                    href={`/artist/${artist.uid}`}
                    className="group overflow-hidden rounded-[26px] border border-white/10 bg-black/35 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.05]"
                  >
                    <div className="relative aspect-square overflow-hidden bg-white/[0.04]">
                      {artist.photoURL ? (
                        <img
                          src={artist.photoURL}
                          alt={displayName}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-5xl text-white/20">
                          ♪
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70 backdrop-blur">
                        Artist
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="line-clamp-1 text-lg font-semibold text-white">
                          {displayName}
                        </div>

                        <div className="mt-1 line-clamp-1 text-xs text-white/65">
                          {artist.genre || "Gospel Artist"}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="line-clamp-2 min-h-[2.6rem] text-xs leading-5 text-white/55">
                        {artist.bio?.trim()
                          ? artist.bio
                          : "Explore this artist profile, songs, and latest activity on ALOSMUSIC."}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-purple-300 transition group-hover:text-purple-200">
                          View profile
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                          Open
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
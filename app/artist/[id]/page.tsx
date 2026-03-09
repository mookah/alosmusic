"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import SiteShell from "@/components/Site/SiteShell";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

type Artist = {
  name?: string;
  stageName?: string;
  fullName?: string;
  genre?: string;
  location?: string;
  bio?: string;
  photoURL?: string;
  coverURL?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  followersCount?: number;
};

type Song = {
  id: string;
  title?: string;
  genre?: string;
  coverURL?: string;
  coverUrl?: string;
  audioURL?: string;
  audioUrl?: string;
  plays?: number;
  streams?: number;
  uid?: string;
  artistId?: string;
};

export default function ArtistPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareText, setShareText] = useState("↗");
  const [activeSongId, setActiveSongId] = useState("");

  useEffect(() => {
    async function loadArtistPage() {
      if (!id) {
        setArtist(null);
        setLoading(false);
        return;
      }

      try {
        let foundArtist: Artist | null = null;

        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          foundArtist = userSnap.data() as Artist;
        } else {
          const artistRef = doc(db, "artists", id);
          const artistSnap = await getDoc(artistRef);

          if (artistSnap.exists()) {
            foundArtist = artistSnap.data() as Artist;
          }
        }

        let songsSnap = await getDocs(
          query(collection(db, "songs"), where("uid", "==", id))
        );

        if (songsSnap.empty) {
          songsSnap = await getDocs(
            query(collection(db, "songs"), where("artistId", "==", id))
          );
        }

        const songsList = songsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Song[];

        if (!foundArtist && songsList.length > 0) {
          const firstSong = songsList[0];
          foundArtist = {
            stageName: firstSong.title ? undefined : "Artist",
            name: firstSong.uid ? undefined : "Artist",
            fullName: firstSong.uid ? undefined : "Artist",
            genre: firstSong.genre || "Gospel",
            bio: "This artist profile has not been fully set up yet.",
            photoURL: "",
            coverURL: "",
            followersCount: 0,
          };
        }

        setArtist(foundArtist);
        setSongs(songsList);
      } catch (error) {
        console.error("Failed to load artist page:", error);
        setArtist(null);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }

    loadArtistPage();
  }, [id]);

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

  const displayName = useMemo(() => {
    if (!artist) return "Artist";
    return artist.stageName || artist.name || artist.fullName || "Unnamed Artist";
  }, [artist]);

  const totalPlays = useMemo(() => {
    return songs.reduce(
      (sum, song) => sum + Number(song.plays || song.streams || 0),
      0
    );
  }, [songs]);

  const followersCount = Number(artist?.followersCount || 0);

  const socialLinks = [
    { label: "Facebook", href: artist?.facebook },
    { label: "Instagram", href: artist?.instagram },
    { label: "YouTube", href: artist?.youtube },
  ].filter((item) => !!item.href);

  async function handleShare() {
    const url =
      typeof window !== "undefined" ? window.location.href : `/artist/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${displayName} on ALOSMUSIC`,
          text: `Check out ${displayName} on ALOSMUSIC`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }

      setShareText("✓");
      setTimeout(() => setShareText("↗"), 1800);
    } catch (error) {
      console.error("Share failed:", error);
      try {
        await navigator.clipboard.writeText(url);
        setShareText("✓");
        setTimeout(() => setShareText("↗"), 1800);
      } catch {}
    }
  }

  function handlePlay(song: Song) {
    const audioSrc = song.audioURL || song.audioUrl || "";
    const coverSrc = song.coverURL || song.coverUrl || "";

    if (!audioSrc) {
      alert("This song has no audio file yet.");
      return;
    }

    const queue = songs
      .filter((item) => item.audioURL || item.audioUrl)
      .map((item) => ({
        id: item.id,
        title: item.title || "Untitled Song",
        artist: displayName,
        genre: item.genre || artist?.genre || "Gospel",
        coverURL: item.coverURL || item.coverUrl || "",
        audioURL: item.audioURL || item.audioUrl || "",
      }));

    const startIndex = queue.findIndex((item) => item.id === song.id);

    if (typeof window !== "undefined") {
      localStorage.setItem("alosmusic_active_song", song.id);
      window.dispatchEvent(new Event("alos:active-song-changed"));
    }

    setActiveSongId(song.id);

    window.dispatchEvent(
      new CustomEvent("alos:play", {
        detail: {
          id: song.id,
          title: song.title || "Untitled Song",
          artist: displayName,
          genre: song.genre || artist?.genre || "Gospel",
          coverURL: coverSrc,
          audioURL: audioSrc,
          queue,
          startIndex,
        },
      })
    );
  }

  if (loading) {
    return (
      <SiteShell title="Artist">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70">
          Loading artist...
        </div>
      </SiteShell>
    );
  }

  if (!artist && songs.length === 0) {
    return (
      <SiteShell title="Artist">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-2xl font-semibold text-white">
            Artist profile not found
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
            This artist does not have a full profile yet, or the profile record
            has not been created in Firestore.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/artists"
              className="rounded-2xl bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
            >
              Back to Artists
            </Link>

            <Link
              href="/upload"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Upload Music
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title={displayName} showTitle={false}>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04]">
          <div className="relative h-56 w-full md:h-72">
            {artist?.coverURL ? (
              <img
                src={artist.coverURL}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[linear-gradient(120deg,rgba(147,51,234,0.45),rgba(30,41,59,0.85),rgba(59,130,246,0.35))]" />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

            <div className="absolute left-6 top-6 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/75 backdrop-blur">
              Artist Profile
            </div>
          </div>

          <div className="relative px-6 pb-6">
            <div className="-mt-16 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="h-28 w-28 overflow-hidden rounded-[28px] border-4 border-black bg-white/10 shadow-2xl">
                  {artist?.photoURL ? (
                    <img
                      src={artist.photoURL}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-4xl text-white/30">
                      ♪
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                      {displayName}
                    </h1>

                    <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-fuchsia-300">
                      Artist
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                    <span>{artist?.genre || "Gospel"}</span>
                    {artist?.location ? (
                      <>
                        <span className="text-white/30">•</span>
                        <span>{artist.location}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Songs
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{songs.length}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Streams
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{totalPlays}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Followers
                  </div>
                  <div className="mt-2 text-2xl font-semibold">{followersCount}</div>
                </div>
              </div>
            </div>

            {artist?.bio ? (
              <div className="mt-6 max-w-3xl rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">
                  About
                </div>
                <p className="text-sm leading-7 text-white/75 md:text-base">
                  {artist.bio}
                </p>
              </div>
            ) : (
              <div className="mt-6 max-w-3xl rounded-2xl border border-dashed border-white/10 bg-black/20 p-5">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">
                  About
                </div>
                <p className="text-sm leading-7 text-white/60 md:text-base">
                  This artist has songs on the platform, but the profile details
                  are not fully set up yet.
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleShare}
                title="Share profile"
                aria-label="Share profile"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-white/80 transition hover:bg-white/[0.08]"
              >
                {shareText}
              </button>

              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href!}
                  target="_blank"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.08]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Songs</h2>
              <p className="mt-1 text-sm text-white/55">
                Music uploaded by {displayName}
              </p>
            </div>
          </div>

          {songs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-white/60">
              No songs uploaded yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {songs.map((song) => {
                const songCover = song.coverURL || song.coverUrl || "";
                const isCurrentSong = activeSongId === song.id;

                return (
                  <div
                    key={song.id}
                    className={`overflow-hidden rounded-[24px] border bg-black/25 transition duration-300 ${
                      isCurrentSong
                        ? "border-fuchsia-500/70 shadow-[0_0_30px_rgba(217,70,239,0.25)] ring-1 ring-fuchsia-400/40 scale-[1.01]"
                        : "border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
                      {songCover ? (
                        <img
                          src={songCover}
                          alt={song.title || "Song cover"}
                          className={`h-full w-full object-cover transition duration-500 ${
                            isCurrentSong ? "scale-105" : ""
                          }`}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-4xl text-white/20">
                          ♫
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      {isCurrentSong && (
                        <div className="absolute right-3 top-3 rounded-full bg-fuchsia-500 px-2 py-1 text-[10px] font-semibold text-white">
                          Playing
                        </div>
                      )}

                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
                        <div className="line-clamp-1 text-lg font-semibold text-white">
                          {song.title || "Untitled Song"}
                        </div>
                        <div className="mt-1 text-xs text-white/65">
                          {song.genre || artist?.genre || "Gospel"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="text-xs text-white/55">
                        {Number(song.plays || song.streams || 0)} streams
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlay(song)}
                        className="relative z-10 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.1]"
                      >
                        Play
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
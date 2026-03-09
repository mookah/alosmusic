"use client";

import { useEffect, useState } from "react";
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
        console.error(err);
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

  if (loading) {
    return (
      <SiteShell title="Charts">
        <div className="p-10 text-white">Loading charts...</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title="Charts">
      <div className="space-y-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-800 to-black p-8">
          <h1 className="text-4xl font-black text-white">
            🔥 ALOSMusic Charts
          </h1>

          <p className="mt-2 text-white/70">
            The most streamed gospel songs right now.
          </p>
        </div>

        <div className="space-y-3">
          {songs.map((song, index) => {
            const isCurrentSong = activeSongId === song.id;

            return (
              <div
                key={song.id}
                className={`flex items-center gap-4 rounded-xl border p-3 transition ${
                  isCurrentSong
                    ? "border-fuchsia-500/60 bg-white/[0.06] ring-1 ring-fuchsia-400/30"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <div className="w-10 text-center text-lg font-bold text-white/70">
                  {index + 1}
                </div>

                <img
                  src={song.coverURL || song.coverUrl || "/cover.png"}
                  alt={song.title || "Song cover"}
                  className="h-14 w-14 rounded object-cover"
                />

                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {song.title || "Untitled"}
                  </p>

                  <p className="text-sm text-white/60">
                    {song.artist || "Unknown Artist"}
                  </p>
                </div>

                <div className="text-sm text-white/50">
                  {song.streams || 0} plays
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playSong(song, index);
                  }}
                  className="rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-500"
                >
                  {isCurrentSong ? "Playing" : "▶ Play"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </SiteShell>
  );
}
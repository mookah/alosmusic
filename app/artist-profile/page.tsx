"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import SiteShell from "@/components/Site/SiteShell";

type Song = {
  id: string;
  title?: string;
  artist?: string;
  coverURL?: string;
  audioURL?: string;
  streams?: number;
};

export default function ArtistProfile() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSongs() {
      try {
        const q = query(collection(db, "songs"));

        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Song[];

        setSongs(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadSongs();
  }, []);

  const totalStreams = songs.reduce(
    (sum, song) => sum + (song.streams || 0),
    0
  );

  return (
    <SiteShell title="Artist Profile">
      <div className="space-y-6">
        {/* PROFILE CARD */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-xl">
              🎤
            </div>

            <div>
              <div className="text-lg font-semibold text-white">
                Gospel Artist
              </div>

              <div className="text-sm text-white/50">
                {songs.length} Songs • {totalStreams} Streams
              </div>
            </div>
          </div>
        </div>

        {/* SONG LIST */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Your Songs
          </h2>

          {loading ? (
            <div className="text-white/60">Loading songs...</div>
          ) : songs.length === 0 ? (
            <div className="text-white/60">
              You have not uploaded any songs yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                >
                  <img
                    src={song.coverURL || "/default-cover.jpg"}
                    className="h-36 w-full object-cover"
                  />

                  <div className="p-3">
                    <div className="truncate text-sm font-semibold text-white">
                      {song.title || "Untitled Song"}
                    </div>

                    <div className="text-xs text-white/50">
                      {song.streams || 0} streams
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
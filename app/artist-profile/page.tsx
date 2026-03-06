"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import SiteShell from "@/components/Site/SiteShell";

type Song = {
  id: string;
  title?: string;
  artist?: string;
  coverURL?: string;
  audioURL?: string;
  streams?: number;
  uid?: string;
};

type UserProfile = {
  name?: string;
  bio?: string;
  photoURL?: string;
};

export default function ArtistProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        setProfileLoading(false);
        return;
      }

      try {
        // load profile
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          setName(data.name || currentUser.displayName || "Gospel Artist");
          setBio(data.bio || "");
          setPhotoURL(data.photoURL || "");
        } else {
          setName(currentUser.displayName || "Gospel Artist");
          setBio("");
          setPhotoURL("");
        }

        setProfileLoading(false);

        // load only this user's songs
        const songsQuery = query(
          collection(db, "songs"),
          where("uid", "==", currentUser.uid)
        );

        const snap = await getDocs(songsQuery);

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
    });

    return () => unsub();
  }, []);

  const totalStreams = songs.reduce((sum, song) => sum + (song.streams || 0), 0);

  return (
    <SiteShell title="Artist Profile">
      <div className="space-y-6">
        {/* PROFILE HEADER */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="h-40 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/10 to-pink-600/20" />

          <div className="px-6 pb-6">
            <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-black bg-white/10">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={name || "Artist"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-3xl text-white/40">
                      🎤
                    </div>
                  )}
                </div>

                <div className="pb-2">
                  <div className="text-3xl font-bold text-white">
                    {profileLoading ? "Loading..." : name || "Gospel Artist"}
                  </div>

                  <div className="mt-1 text-sm text-white/60">
                    {songs.length} Songs • {totalStreams} Streams
                  </div>

                  {bio && (
                    <p className="mt-2 max-w-2xl text-sm text-white/65">
                      {bio}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* SONG LIST */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Your Songs</h2>

          {loading ? (
            <div className="text-white/60">Loading songs...</div>
          ) : !user ? (
            <div className="text-white/60">Please sign in to view your profile.</div>
          ) : songs.length === 0 ? (
            <div className="text-white/60">You have not uploaded any songs yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <img
                    src={song.coverURL || "/default-cover.jpg"}
                    alt={song.title || "Song cover"}
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
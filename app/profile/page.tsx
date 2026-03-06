"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import SiteShell from "@/components/Site/SiteShell";
import { auth, db, storage } from "@/lib/firebase";

type ArtistProfile = {
  displayName?: string;
  bio?: string;
  photoURL?: string;
  coverURL?: string;
  ministry?: string;
  location?: string;
  email?: string;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  audioURL: string;
  coverURL: string;
  uid: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [ministry, setMinistry] = useState("");
  const [location, setLocation] = useState("");
  const [photoURL, setPhotoURL] = useState("/default-avatar.jpg");
  const [coverURL, setCoverURL] = useState("/default-cover.jpg");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const artistRef = doc(db, "artists", currentUser.uid);
        const artistSnap = await getDoc(artistRef);

        if (artistSnap.exists()) {
          const data = artistSnap.data() as ArtistProfile;
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
          setMinistry(data.ministry || "");
          setLocation(data.location || "");
          setPhotoURL(data.photoURL || "/default-avatar.jpg");
          setCoverURL(data.coverURL || "/default-cover.jpg");
        } else {
          setDisplayName(currentUser.displayName || "");
        }

        const songsQ = query(
          collection(db, "songs"),
          where("uid", "==", currentUser.uid)
        );
        const songsSnap = await getDocs(songsQ);

        const mySongs = songsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Song[];

        setSongs(mySongs);
      } catch (error: any) {
        setMessage(error?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setMessage("");

      let nextPhotoURL = photoURL;
      let nextCoverURL = coverURL;

      if (photoFile) {
        const photoRef = ref(
          storage,
          `artists/${user.uid}/profile_${Date.now()}_${photoFile.name}`
        );
        await uploadBytes(photoRef, photoFile);
        nextPhotoURL = await getDownloadURL(photoRef);
      }

      if (coverFile) {
        const coverRef = ref(
          storage,
          `artists/${user.uid}/cover_${Date.now()}_${coverFile.name}`
        );
        await uploadBytes(coverRef, coverFile);
        nextCoverURL = await getDownloadURL(coverRef);
      }

      await setDoc(
        doc(db, "artists", user.uid),
        {
          displayName: displayName.trim(),
          bio: bio.trim(),
          ministry: ministry.trim(),
          location: location.trim(),
          email: user.email || "",
          photoURL: nextPhotoURL,
          coverURL: nextCoverURL,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setPhotoURL(nextPhotoURL);
      setCoverURL(nextCoverURL);
      setPhotoFile(null);
      setCoverFile(null);
      setMessage("Profile updated successfully.");
    } catch (error: any) {
      setMessage(error?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SiteShell title="Profile" showTitle={false}>
        <div className="p-6 text-white">Loading profile...</div>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell title="Profile" showTitle={false}>
        <div className="p-6 text-white">Please sign in to view your profile.</div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title="Profile" showTitle={false}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div
            className="h-52 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${coverURL || "/default-cover.jpg"})` }}
          />
          <div className="relative px-6 pb-6">
            <div className="-mt-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <img
                  src={photoURL || "/default-avatar.jpg"}
                  alt="Profile"
                  className="h-28 w-28 rounded-full border-4 border-black object-cover"
                />
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-white">
                    {displayName || "My Profile"}
                  </h1>
                  <p className="text-sm text-white/60">{user.email}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300">
                {songs.length} song{songs.length === 1 ? "" : "s"} uploaded
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Edit Profile</h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none"
              />

              <textarea
                placeholder="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="Ministry / Church"
                value={ministry}
                onChange={(e) => setMinistry(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none"
              />

              <div>
                <label className="mb-2 block text-sm text-white/70">Profile photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="block w-full text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">Cover photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="block w-full text-white"
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-fuchsia-600 px-6 py-3 font-semibold text-white"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">My Songs</h2>

            {songs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white/60">
                You have not uploaded any songs yet.
              </div>
            ) : (
              <div className="space-y-3">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-3"
                  >
                    <img
                      src={song.coverURL || "/default-cover.jpg"}
                      alt={song.title}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-white">{song.title}</div>
                      <div className="truncate text-sm text-white/60">
                        {song.artist || "Unknown Artist"} • {song.genre || "Gospel"}
                      </div>
                    </div>
                    <audio controls className="w-44">
                      <source src={song.audioURL} />
                    </audio>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
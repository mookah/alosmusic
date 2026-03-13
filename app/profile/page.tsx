"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import SiteShell from "@/components/Site/SiteShell";
import { auth, db, storage } from "@/lib/firebase";
import {
  checkIsAdmin,
  deleteSong,
  setSongApproval,
  updateSongDetails,
} from "@/lib/songActions";

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
  streams?: number;
  approved?: boolean;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [ministry, setMinistry] = useState("");
  const [location, setLocation] = useState("");
  const [photoURL, setPhotoURL] = useState("/default-avatar.jpg");
  const [coverURL, setCoverURL] = useState("/default-cover.jpg");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [songActionLoading, setSongActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeSongs: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setSongs([]);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await checkIsAdmin(currentUser.uid);
        setIsAdmin(adminStatus);

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
          setBio("");
          setMinistry("");
          setLocation("");
          setPhotoURL("/default-avatar.jpg");
          setCoverURL("/default-cover.jpg");
        }

        const songsQ = query(
          collection(db, "songs"),
          where("uid", "==", currentUser.uid)
        );

        unsubscribeSongs = onSnapshot(
          songsQ,
          (songsSnap) => {
            const mySongs = songsSnap.docs.map((docSnap) => {
              const data = docSnap.data();

              return {
                id: docSnap.id,
                title: data.title || "",
                artist: data.artist || "",
                genre: data.genre || "",
                audioURL: data.audioURL || "",
                coverURL: data.coverURL || "/default-cover.jpg",
                uid: data.uid || "",
                streams: data.streams ?? 0,
                approved: data.approved ?? false,
              };
            }) as Song[];

            setSongs(mySongs);
          },
          (error) => {
            console.error("Songs listener failed:", error);
            setMessage("Failed to load songs.");
          }
        );
      } catch (error: any) {
        console.error("Failed to load profile:", error);
        setMessage(error?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubscribeSongs) unsubscribeSongs();
    };
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
      console.error("Failed to save profile:", error);
      setMessage(error?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  function startEditSong(song: Song) {
    setEditingSongId(song.id);
    setEditTitle(song.title || "");
    setEditArtist(song.artist || "");
    setEditGenre(song.genre || "");
  }

  function cancelEditSong() {
    setEditingSongId(null);
    setEditTitle("");
    setEditArtist("");
    setEditGenre("");
  }

  async function handleSaveSong(songId: string) {
    try {
      setSongActionLoading(songId);
      await updateSongDetails(songId, {
        title: editTitle.trim(),
        artist: editArtist.trim(),
        genre: editGenre.trim(),
      });
      cancelEditSong();
    } catch (error) {
      console.error(error);
      alert("Failed to update song.");
    } finally {
      setSongActionLoading(null);
    }
  }

  async function handleDeleteSong(song: Song) {
    const ok = confirm(`Delete "${song.title}"?`);
    if (!ok) return;

    try {
      setSongActionLoading(song.id);
      await deleteSong(song.id, song.audioURL, song.coverURL);
    } catch (error) {
      console.error(error);
      alert("Failed to delete song.");
    } finally {
      setSongActionLoading(null);
    }
  }

  async function handleToggleApproval(song: Song) {
    try {
      setSongActionLoading(song.id);
      await setSongApproval(song.id, !song.approved);
    } catch (error) {
      console.error(error);
      alert("Failed to update approval status.");
    } finally {
      setSongActionLoading(null);
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
                  {isAdmin && (
                    <div className="mt-2 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                      Admin
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300">
                {songs.length} song{songs.length === 1 ? "" : "s"} uploaded
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
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
                {songs.map((song) => {
                  const isEditing = editingSongId === song.id;
                  const isBusy = songActionLoading === song.id;

                  return (
                    <div
                      key={song.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-3"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                        <img
                          src={song.coverURL || "/default-cover.jpg"}
                          alt={song.title || "Song cover"}
                          className="h-16 w-16 rounded-xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Song title"
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                              />
                              <input
                                type="text"
                                value={editArtist}
                                onChange={(e) => setEditArtist(e.target.value)}
                                placeholder="Artist"
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                              />
                              <input
                                type="text"
                                value={editGenre}
                                onChange={(e) => setEditGenre(e.target.value)}
                                placeholder="Genre"
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="truncate font-medium text-white">
                                {song.title || "Untitled"}
                              </div>
                              <div className="truncate text-sm text-white/60">
                                {song.artist || "Unknown Artist"} • {song.genre || "Gospel"}
                              </div>
                              <div className="mt-1 text-xs text-white/45">
                                {song.streams ?? 0} streams •{" "}
                                {song.approved ? "Approved" : "Pending"}
                              </div>
                            </>
                          )}
                        </div>

                        <audio controls className="w-full xl:w-44">
                          <source src={song.audioURL} />
                        </audio>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveSong(song.id)}
                              disabled={isBusy}
                              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                            >
                              {isBusy ? "Saving..." : "Save Song"}
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditSong}
                              disabled={isBusy}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditSong(song)}
                              disabled={isBusy}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSong(song)}
                              disabled={isBusy}
                              className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                            >
                              {isBusy ? "Deleting..." : "Delete"}
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleToggleApproval(song)}
                                disabled={isBusy}
                                className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
                              >
                                {song.approved ? "Unapprove" : "Approve"}
                              </button>
                            )}

                            {isAdmin && (
                              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300">
                                Admin can remove copyright or unwanted uploads
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import SiteShell from "@/components/Site/SiteShell";

export default function ArtistSetupPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stageName, setStageName] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [genre, setGenre] = useState("Gospel");
  const [photoURL, setPhotoURL] = useState("");
  const [coverURL, setCoverURL] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) {
        setLoadingUser(false);
        return;
      }

      try {
        const artistRef = doc(db, "artists", u.uid);
        const userRef = doc(db, "users", u.uid);

        const [artistSnap, userSnap] = await Promise.all([
          getDoc(artistRef),
          getDoc(userRef),
        ]);

        if (artistSnap.exists()) {
          const data = artistSnap.data();
          setStageName(data.stageName || "");
          setFullName(data.fullName || "");
          setBio(data.bio || "");
          setLocation(data.location || "");
          setGenre(data.genre || "Gospel");
          setPhotoURL(data.photoURL || "");
          setCoverURL(data.coverURL || "");
          setFacebook(data.facebook || "");
          setInstagram(data.instagram || "");
          setYoutube(data.youtube || "");
        } else if (userSnap.exists()) {
          const data = userSnap.data();
          setStageName(data.stageName || "");
          setFullName(data.fullName || data.name || u.displayName || "");
          setBio(data.bio || "");
          setLocation(data.location || "");
          setGenre(data.genre || "Gospel");
          setPhotoURL(data.photoURL || u.photoURL || "");
          setCoverURL(data.coverURL || "");
          setFacebook(data.facebook || "");
          setInstagram(data.instagram || "");
          setYoutube(data.youtube || "");
        } else {
          setFullName(u.displayName || "");
          setPhotoURL(u.photoURL || "");
        }
      } catch (error) {
        console.error("Failed to load artist profile:", error);
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsub();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      const artistRef = doc(db, "artists", user.uid);
      const userRef = doc(db, "users", user.uid);

      const artistPayload = {
        uid: user.uid,
        email: user.email || "",
        stageName: stageName.trim(),
        fullName: fullName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        genre: genre.trim() || "Gospel",
        photoURL: photoURL.trim(),
        coverURL: coverURL.trim(),
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        youtube: youtube.trim(),
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const userPayload = {
        uid: user.uid,
        email: user.email || "",
        name: stageName.trim() || fullName.trim() || user.displayName || "",
        stageName: stageName.trim(),
        fullName: fullName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        genre: genre.trim() || "Gospel",
        photoURL: photoURL.trim(),
        coverURL: coverURL.trim(),
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        youtube: youtube.trim(),
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await Promise.all([
        setDoc(artistRef, artistPayload, { merge: true }),
        setDoc(userRef, userPayload, { merge: true }),
      ]);

      router.push(`/artist/${user.uid}`);
    } catch (error: any) {
      console.error("Failed to save artist profile:", error);
      alert(error?.message || "Failed to save artist profile");
    } finally {
      setSaving(false);
    }
  }

  if (loadingUser) {
    return (
      <SiteShell title="Artist Setup">
        <div className="text-white/70">Loading...</div>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell title="Artist Setup">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          Please sign in first from the Login / Admin button.
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title="Artist Setup">
      <form
        onSubmit={handleSave}
        className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Create Artist Profile</h1>
          <p className="mt-1 text-sm text-white/60">
            Set up your public artist page so you can upload and share your songs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="Stage name"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            required
          />
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
        </div>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Artist bio"
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="Profile photo URL"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
          <input
            value={coverURL}
            onChange={(e) => setCoverURL(e.target.value)}
            placeholder="Cover image URL"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="Facebook link"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram link"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
          <input
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="YouTube link"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Artist Profile"}
        </button>
      </form>
    </SiteShell>
  );
}
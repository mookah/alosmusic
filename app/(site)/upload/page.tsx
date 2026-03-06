"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import SiteShell from "@/components/Site/SiteShell";
import BottomPlayer from "@/components/Player/BottomPlayer";
import LoadingOverlay from "@/components/LoadingOverlay";
import { auth, db, storage } from "@/lib/firebase";

const GENRES = [
  "Gospel",
  "Afro Gospel",
  "Worship",
  "Praise",
  "Hip Hop Gospel",
  "Acoustic",
  "Other",
];

export default function UploadPage() {
  // auth
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // form
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Gospel");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // ui
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [msg, setMsg] = useState<string>("");

  const googleProvider = useMemo(() => new GoogleAuthProvider(), []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // ---------- AUTH ACTIONS ----------
  async function handleSignUp() {
    setMsg("");
    try {
      if (!email || !password) return setMsg("❌ Enter email and password.");
      await createUserWithEmailAndPassword(auth, email, password);
      setMsg("✅ Account created & logged in.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Sign up failed"}`);
    }
  }

  async function handleSignIn() {
    setMsg("");
    try {
      if (!email || !password) return setMsg("❌ Enter email and password.");
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("✅ Logged in.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Sign in failed"}`);
    }
  }

  async function handleGoogle() {
    setMsg("");
    try {
      await signInWithPopup(auth, googleProvider);
      setMsg("✅ Logged in with Google.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Google sign-in failed"}`);
    }
  }

  async function handleSignOut() {
    setMsg("");
    try {
      await signOut(auth);
      setMsg("✅ Logged out.");
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Sign out failed"}`);
    }
  }

  // ---------- UPLOAD ----------
  async function handleUpload() {
    setMsg("");

    if (!user) return setMsg("❌ Please login first.");
    if (!title.trim()) return setMsg("❌ Song title is required.");
    if (!audioFile) return setMsg("❌ Please choose an MP3 audio file.");

    const isMp3 =
      audioFile.type === "audio/mpeg" ||
      audioFile.name.toLowerCase().endsWith(".mp3") ||
      audioFile.name.toLowerCase().endsWith(".mpeg");
    if (!isMp3) return setMsg("❌ Audio must be an MP3 file.");

    if (coverFile) {
      const okImg =
        coverFile.type.startsWith("image/") ||
        coverFile.name.toLowerCase().endsWith(".jpg") ||
        coverFile.name.toLowerCase().endsWith(".jpeg") ||
        coverFile.name.toLowerCase().endsWith(".png") ||
        coverFile.name.toLowerCase().endsWith(".webp");
      if (!okImg) return setMsg("❌ Cover must be an image (jpg/png/webp).");
    }

    try {
      setLoading(true);
      setProgress(0);

      const safeTitle = title
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const songId = `${user.uid}_${Date.now()}_${safeTitle}`;

      const audioPath = `songs/${user.uid}/${songId}/audio_${audioFile.name}`;
      const coverPath = coverFile
        ? `songs/${user.uid}/${songId}/cover_${coverFile.name}`
        : null;

      const audioRef = ref(storage, audioPath);
      const audioTask = uploadBytesResumable(audioRef, audioFile);

      const audioUrl: string = await new Promise((resolve, reject) => {
        audioTask.on(
          "state_changed",
          (snap) => {
            const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
            setProgress(pct);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(audioTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      let coverUrl = "";
      if (coverFile && coverPath) {
        const coverRef = ref(storage, coverPath);
        await uploadBytesResumable(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverRef);
      }

      await addDoc(collection(db, "songs"), {
        title: title.trim(),
        artist: artist.trim() || "Unknown Artist",
        genre,
        audioUrl,
        coverUrl: coverUrl || "",
        plays: 0,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email || "",
      });

      setMsg("✅ Uploaded successfully!");
      setTitle("");
      setArtist("");
      setGenre("Gospel");
      setAudioFile(null);
      setCoverFile(null);
      setProgress(100);
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Upload failed"}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  return (
    <>
      {/* Overlay loader (logo animation) */}
      <LoadingOverlay
        show={loading}
        label={loading ? "Uploading your song..." : "Loading..."}
        progress={loading ? progress : undefined}
      />

      <SiteShell title="Upload">
        {/* IMPORTANT: remove full-page background; SiteShell already handles the layout */}
        <div className="w-full max-w-4xl mx-auto pb-24">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
            Upload
          </h1>

          {/* AUTH CARD */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_0_60px_rgba(168,85,247,.08)]">
            <p className="text-sm text-white/70 mb-3">
              Status:{" "}
              <span className="text-white">
                {user ? `Logged in as ${user.email || user.uid}` : "Not logged in"}
              </span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={handleSignUp}
                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2"
              >
                Sign up
              </button>
              <button
                onClick={handleSignIn}
                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2"
              >
                Sign in
              </button>
              <button
                onClick={handleGoogle}
                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2"
              >
                Google
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* UPLOAD CARD */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_0_60px_rgba(168,85,247,.08)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                placeholder="Song title (required)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                placeholder="Artist (optional)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />

              <select
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <div className="text-sm text-white/60 flex items-center">
                {audioFile ? (
                  <span className="truncate">🎵 {audioFile.name}</span>
                ) : (
                  <span>Choose an mp3 file below</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <label className="block">
                <span className="text-xs text-white/60">Audio (mp3)</span>
                <input
                  type="file"
                  accept=".mp3,audio/mpeg"
                  className="mt-2 block w-full text-sm text-white/70
                    file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white
                    hover:file:bg-white/15"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
              </label>

              <label className="block">
                <span className="text-xs text-white/60">Cover (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-white/70
                    file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white
                    hover:file:bg-white/15"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* PROGRESS BAR */}
            {loading && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                  <span>Uploading…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all"
                    style={{ width: `${Math.max(2, Math.round(progress))}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 font-medium disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload song"}
            </button>

            {msg && <p className="mt-4 text-sm text-white/80">{msg}</p>}
            {!user && (
              <p className="mt-2 text-xs text-white/50">
                Please login first (Auth required).
              </p>
            )}
          </div>
        </div>
      </SiteShell>

      {/* Bottom sticky player */}
      <BottomPlayer />
    </>
  );
}
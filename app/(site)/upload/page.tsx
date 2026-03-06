"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { uploadSongToFirebase } from "@/lib/uploadSong";
import SiteShell from "@/components/Site/SiteShell";

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Gospel");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please sign in first.");
      return;
    }

    if (!title.trim()) {
      setMessage("Song title is required.");
      return;
    }

    if (!audioFile) {
      setMessage("Please choose an MP3 file.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      await uploadSongToFirebase({
        title,
        artist,
        genre,
        audioFile,
        coverFile: coverFile || undefined,
        uid: user.uid,
        onProgress: setProgress,
      });

      setMessage("Song uploaded successfully.");
      setTitle("");
      setArtist("");
      setGenre("Gospel");
      setAudioFile(null);
      setCoverFile(null);
      setProgress(0);

      const audioInput = document.getElementById("audioFile") as HTMLInputElement | null;
      const coverInput = document.getElementById("coverFile") as HTMLInputElement | null;
      if (audioInput) audioInput.value = "";
      if (coverInput) coverInput.value = "";
    } catch (error: any) {
      setMessage(error?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell title="Upload" showTitle={false}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.9)]" />
            Gospel Music Platform
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Upload your music
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-white/65 md:text-base">
            Share Zambia gospel sounds, worship moments, and live praise with the world.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Upload Song</h2>
                <p className="mt-1 text-sm text-white/55">
                  {user ? `Logged in as ${user.email}` : "Please sign in before uploading."}
                </p>
              </div>

              <div className="hidden rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-right md:block">
                <div className="text-xs text-white/50">Status</div>
                <div className="text-sm font-medium text-fuchsia-300">
                  {user ? "Ready to upload" : "Login required"}
                </div>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500/40 focus:ring-2 focus:ring-fuchsia-500/20"
              />

              <input
                type="text"
                placeholder="Artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500/40 focus:ring-2 focus:ring-fuchsia-500/20"
              />

              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-fuchsia-500/40 focus:ring-2 focus:ring-fuchsia-500/20"
              >
                <option value="Gospel">Gospel</option>
                <option value="Praise">Praise</option>
                <option value="Worship">Worship</option>
                <option value="Contemporary">Contemporary</option>
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Audio (MP3)
                  </label>
                  <input
                    id="audioFile"
                    type="file"
                    accept=".mp3,audio/mpeg"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-fuchsia-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-fuchsia-500"
                  />
                  <p className="mt-2 text-xs text-white/45">
                    Upload a clean MP3 for best streaming quality.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <label className="mb-2 block text-sm font-medium text-white/75">
                    Cover image (optional)
                  </label>
                  <input
                    id="coverFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-white/15"
                  />
                  <p className="mt-2 text-xs text-white/45">
                    Square image recommended, like 1500 × 1500.
                  </p>
                </div>
              </div>

              {loading && (
                <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-fuchsia-300">Uploading...</span>
                    <span className="text-white/80">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-fuchsia-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    message.toLowerCase().includes("success")
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || !user}
                  className="rounded-2xl bg-fuchsia-600 px-6 py-3 font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload song"}
                </button>

                <span className="text-sm text-white/45">
                  {user ? "Your upload will be saved to ALOSMUSIC." : "Sign in to continue."}
                </span>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white">Upload Tips</h3>
              <div className="mt-4 space-y-3 text-sm text-white/60">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  Use a clear song title and artist name.
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  Add cover art to make your song stand out.
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  Gospel, praise, and worship tracks perform best with good artwork.
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-violet-500/10 p-5">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-fuchsia-300">
                ALOSMUSIC
              </div>
              <h3 className="text-2xl font-bold text-white">
                Share your sound with a modern gospel audience
              </h3>
              <p className="mt-3 text-sm text-white/60">
                Upload once, stream anywhere on your platform, and build your artist presence.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-fuchsia-500/20 shadow-[0_0_30px_rgba(217,70,239,0.35)]" />
                <div className="h-10 w-10 rounded-full bg-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.35)]" />
                <div className="h-10 w-10 rounded-full bg-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.35)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
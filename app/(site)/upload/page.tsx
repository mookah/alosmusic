"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { uploadSongToFirebase } from "@/lib/uploadSong";
import SiteShell from "@/components/Site/SiteShell";

export default function UploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Gospel");

  // NEW
  const [country, setCountry] = useState("Zambia");

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
        country, // NEW
        audioFile,
        coverFile: coverFile || undefined,
        uid: user.uid,
        onProgress: setProgress,
      });

      setMessage("Song uploaded successfully.");
      setTitle("");
      setArtist("");
      setGenre("Gospel");
      setCountry("Zambia");
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
            <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
            Gospel Music Platform
          </div>

          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-5xl">
            Upload your music
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-white/65 md:text-base">
            Share Zambia gospel sounds, worship moments, and live praise with the world.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <form onSubmit={handleUpload} className="space-y-4">

              <input
                type="text"
                placeholder="Song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white"
              />

              <input
                type="text"
                placeholder="Artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white"
              />

              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white"
              >
                <option value="Gospel">Gospel</option>
                <option value="Praise">Praise</option>
                <option value="Worship">Worship</option>
                <option value="Contemporary">Contemporary</option>
              </select>

              {/* NEW COUNTRY FIELD */}

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white"
              >
                <option value="Zambia">🇿🇲 Zambia</option>
                <option value="Nigeria">🇳🇬 Nigeria</option>
                <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
                <option value="Ghana">🇬🇭 Ghana</option>
                <option value="South Africa">🇿🇦 South Africa</option>
                <option value="Kenya">🇰🇪 Kenya</option>
                <option value="Tanzania">🇹🇿 Tanzania</option>
              </select>

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="text-sm text-white/70">Audio</label>
                  <input
                    id="audioFile"
                    type="file"
                    accept=".mp3,audio/mpeg"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="block w-full text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70">Cover</label>
                  <input
                    id="coverFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="block w-full text-white"
                  />
                </div>

              </div>

              {loading && (
                <div className="text-white">
                  Uploading... {progress}%
                </div>
              )}

              {message && (
                <div className="text-white">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !user}
                className="rounded-2xl bg-fuchsia-600 px-6 py-3 text-white"
              >
                {loading ? "Uploading..." : "Upload song"}
              </button>

            </form>

          </div>

        </div>
      </div>
    </SiteShell>
  );
}
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { uploadSongToFirebase } from "@/lib/uploadSong";

import PageContainer from "@/components/ui/PageContainer";
import SectionHeader from "@/components/ui/SectionHeader";
import PremiumCard from "@/components/ui/PremiumCard";
import PremiumButton from "@/components/ui/PremiumButton";
import PremiumInput from "@/components/ui/PremiumInput";

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
      setMessage("Please choose an audio file.");
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

    } catch (error: any) {
      setMessage(error?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>

      <SectionHeader
        title="Upload your music"
        subtitle="Share your gospel music with listeners around the world."
        badgeText="ARTIST UPLOAD"
      />

      <div className="max-w-2xl">

        <PremiumCard>

          <form onSubmit={handleUpload} className="space-y-4">

            <PremiumInput
              placeholder="Song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <PremiumInput
              placeholder="Artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />

            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="premium-input"
            >
              <option value="Gospel">Gospel</option>
              <option value="Praise">Praise</option>
              <option value="Worship">Worship</option>
              <option value="Contemporary">Contemporary</option>
            </select>

            <div className="space-y-2">

              <label className="text-sm text-white/70">
                Audio File
              </label>

              <input
                type="file"
                accept="audio/*"
                onChange={(e) =>
                  setAudioFile(e.target.files?.[0] || null)
                }
                className="text-sm"
              />

            </div>

            <div className="space-y-2">

              <label className="text-sm text-white/70">
                Cover Image (optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCoverFile(e.target.files?.[0] || null)
                }
                className="text-sm"
              />

            </div>

            {loading && (
              <div className="text-sm text-white/70">
                Uploading... {progress}%
              </div>
            )}

            {message && (
              <div className="text-sm text-fuchsia-300">
                {message}
              </div>
            )}

            <PremiumButton
              variant="blue"
              type="submit"
              disabled={loading || !user}
            >
              {loading ? "Uploading..." : "Upload Song"}
            </PremiumButton>

          </form>

        </PremiumCard>

      </div>

    </PageContainer>
  );
}
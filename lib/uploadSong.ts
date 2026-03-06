// lib/uploadSong.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

type UploadSongParams = {
  title: string;
  artist?: string;
  genre?: string;
  audioFile: File;
  coverFile?: File;
  uid: string;
  onProgress?: (percent: number) => void;
};

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

export async function uploadSongToFirebase({
  title,
  artist = "Unknown Artist",
  genre = "Gospel",
  audioFile,
  coverFile,
  uid,
  onProgress,
}: UploadSongParams) {
  if (!uid) throw new Error("You must be logged in.");
  if (!title.trim()) throw new Error("Song title is required.");
  if (!audioFile) throw new Error("Audio file is required.");

  const time = Date.now();

  // upload audio
  const audioName = safeFileName(audioFile.name);
  const audioRef = ref(storage, `songs/${uid}/${time}_${audioName}`);
  const audioTask = uploadBytesResumable(audioRef, audioFile);

  const audioURL: string = await new Promise((resolve, reject) => {
    audioTask.on(
      "state_changed",
      (snapshot) => {
        const percent =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(percent));
      },
      reject,
      async () => {
        const url = await getDownloadURL(audioTask.snapshot.ref);
        resolve(url);
      }
    );
  });

  // upload cover or use default
  let coverURL = "/default-cover.jpg";

  if (coverFile) {
    const coverName = safeFileName(coverFile.name);
    const coverRef = ref(storage, `covers/${uid}/${time}_${coverName}`);
    const coverTask = uploadBytesResumable(coverRef, coverFile);

    coverURL = await new Promise((resolve, reject) => {
      coverTask.on(
        "state_changed",
        undefined,
        reject,
        async () => {
          const url = await getDownloadURL(coverTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  }

  const docRef = await addDoc(collection(db, "songs"), {
    title: title.trim(),
    artist: artist.trim() || "Unknown Artist",
    genre: genre.trim() || "Gospel",
    audioURL,
    coverURL,
    uid,
    streams: 0,
    approved: false,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id };
}
// lib/uploadSong.ts

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  UploadMetadata,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";

type UploadSongParams = {
  title: string;
  artist?: string;
  genre?: string;
  country?: string;
  audioFile: File;
  coverFile?: File;
  uid: string;
  onProgress?: (percent: number) => void;
};

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

function normalizeCountry(input?: string) {
  const value = (input || "").toLowerCase().trim();

  if (!value) return "Zambia";

  if (value.includes("zambia")) return "Zambia";
  if (value.includes("nigeria")) return "Nigeria";
  if (value.includes("zimbabwe")) return "Zimbabwe";
  if (value.includes("ghana")) return "Ghana";
  if (value.includes("south africa")) return "South Africa";
  if (value.includes("kenya")) return "Kenya";
  if (value.includes("tanzania")) return "Tanzania";

  return "Zambia";
}

export async function uploadSongToFirebase({
  title,
  artist = "Unknown Artist",
  genre = "Gospel",
  country = "Zambia",
  audioFile,
  coverFile,
  uid,
  onProgress,
}: UploadSongParams) {
  if (!uid) throw new Error("Login required.");
  if (!audioFile) throw new Error("Audio file required.");

  const normalizedCountry = normalizeCountry(country);

  const time = Date.now();

  const audioRef = ref(storage, `songs/${uid}/${time}_${safeFileName(audioFile.name)}`);

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

  let coverURL = "/default-cover.jpg";

  if (coverFile) {
    const coverRef = ref(
      storage,
      `covers/${uid}/${time}_${safeFileName(coverFile.name)}`
    );

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
    artist: artist.trim(),
    genre,
    country: normalizedCountry,
    audioURL,
    coverURL,
    uid,
    streams: 0,
    approved: false,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id };
}
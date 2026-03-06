// lib/uploadSong.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export async function uploadSongToFirebase(params: {
  title: string;
  artist?: string;
  genre?: string;
  audioFile: File;
  coverFile?: File;
  uid: string;
  onProgress?: (percent: number) => void;
}) {
  const {
    title,
    artist = "Unknown Artist",
    genre = "Gospel",
    audioFile,
    coverFile,
    uid,
    onProgress,
  } = params;

  const safeName = audioFile.name.replace(/\s+/g, "_");
  const audioRef = ref(storage, `songs/${uid}_${Date.now()}_${safeName}`);
  const uploadTask = uploadBytesResumable(audioRef, audioFile);

  return new Promise<{ id: string }>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(percent));
      },
      (error) => reject(error),
      async () => {
        try {
          const audioUrl = await getDownloadURL(uploadTask.snapshot.ref);

          let coverUrl = "";
          if (coverFile) {
            const coverSafe = coverFile.name.replace(/\s+/g, "_");
            const coverRef = ref(storage, `covers/${uid}_${Date.now()}_${coverSafe}`);
            const coverTask = uploadBytesResumable(coverRef, coverFile);

            await new Promise<void>((res, rej) => {
              coverTask.on("state_changed", undefined, rej, () => res());
            });

            coverUrl = await getDownloadURL(coverTask.snapshot.ref);
          }

          const doc = await addDoc(collection(db, "songs"), {
            title,
            artist,
            genre,
            audioUrl,
            coverUrl,
            plays: 0,
            createdAt: serverTimestamp(),
            createdByUid: uid,
          });

          resolve({ id: doc.id });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
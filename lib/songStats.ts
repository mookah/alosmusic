import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const countedSongs = new Set<string>();

export async function incrementSongPlays(songId: string) {
  if (!songId) return;
  if (countedSongs.has(songId)) return;

  countedSongs.add(songId);

  try {
    const ref = doc(db, "songs", songId);

    await updateDoc(ref, {
      streams: increment(1),
    });
  } catch (error) {
    console.error("Failed to update stream count:", error);
    countedSongs.delete(songId);
  }
}
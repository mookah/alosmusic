import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function incrementSongPlays(songId: string) {
  if (!songId) return;

  try {
    const ref = doc(db, "songs", songId);
    await updateDoc(ref, {
      plays: increment(1),
    });
  } catch (error) {
    console.error("Failed to increment plays:", error);
  }
}
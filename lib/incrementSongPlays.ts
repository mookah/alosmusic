import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export async function incrementSongPlays(songId: string) {
  if (!songId) return;

  try {
    const songRef = doc(db, "songs", songId);
    await updateDoc(songRef, {
      plays: increment(1),
    });
  } catch (error) {
    console.error("Failed to increment plays:", error);
  }
}
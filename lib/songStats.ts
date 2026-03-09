import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function incrementSongPlays(songId: string) {
  try {
    const ref = doc(db, "songs", songId);

    await updateDoc(ref, {
      streams: increment(1),
    });
  } catch (error) {
    console.error("Failed to update stream count:", error);
  }
}
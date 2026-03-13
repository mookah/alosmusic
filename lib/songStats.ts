import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const memoryCountedSongs = new Set<string>();

function getStreamKey(songId: string) {
  return `alosmusic_stream_counted_${songId}`;
}

function hasCountedInSession(songId: string) {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(getStreamKey(songId)) === "true";
}

function markCountedInSession(songId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(getStreamKey(songId), "true");
}

export async function incrementSongPlays(songId: string) {
  if (!songId) return;

  if (memoryCountedSongs.has(songId)) return;
  if (hasCountedInSession(songId)) {
    memoryCountedSongs.add(songId);
    return;
  }

  memoryCountedSongs.add(songId);

  try {
    const ref = doc(db, "songs", songId);

    await updateDoc(ref, {
      streams: increment(1),
    });

    markCountedInSession(songId);
  } catch (error) {
    console.error("Failed to update stream count:", error);
    memoryCountedSongs.delete(songId);
  }
}
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export async function deleteSong(
  songId: string,
  audioURL?: string,
  coverURL?: string
) {
  if (!songId) throw new Error("Song ID is required.");

  await deleteDoc(doc(db, "songs", songId));

  if (audioURL) {
    try {
      await deleteObject(ref(storage, audioURL));
    } catch (error) {
      console.warn("Audio delete skipped:", error);
    }
  }

  if (coverURL && !coverURL.includes("/default-cover")) {
    try {
      await deleteObject(ref(storage, coverURL));
    } catch (error) {
      console.warn("Cover delete skipped:", error);
    }
  }
}

export async function updateSongDetails(
  songId: string,
  data: {
    title?: string;
    artist?: string;
    genre?: string;
  }
) {
  if (!songId) throw new Error("Song ID is required.");

  await updateDoc(doc(db, "songs", songId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function setSongApproval(songId: string, approved: boolean) {
  if (!songId) throw new Error("Song ID is required.");

  await updateDoc(doc(db, "songs", songId), {
    approved,
    updatedAt: new Date().toISOString(),
  });
}

export async function checkIsAdmin(uid: string) {
  if (!uid) return false;

  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) return false;

    const data = userSnap.data();
    return data?.role === "admin";
  } catch {
    return false;
  }
}
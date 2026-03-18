import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export async function likeSong(userId: string, songId: string) {
  if (!userId || !songId) return;

  await setDoc(doc(db, "users", userId, "likes", songId), {
    songId,
    createdAt: serverTimestamp(),
  });
}

export async function unlikeSong(userId: string, songId: string) {
  if (!userId || !songId) return;

  await deleteDoc(doc(db, "users", userId, "likes", songId));
}

export async function isLiked(userId: string, songId: string) {
  if (!userId || !songId) return false;

  const snap = await getDoc(doc(db, "users", userId, "likes", songId));
  return snap.exists();
}
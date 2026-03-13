import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function updateSong(songId: string, data: any) {
  const ref = doc(db, "songs", songId);

  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  });
}
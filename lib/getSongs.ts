import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Track } from "@/lib/playerStore";

export async function getApprovedSongs(max = 12): Promise<Track[]> {
  const q = query(
    collection(db, "songs"),
    where("approved", "==", true),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title || "Untitled Song",
      artist: data.artist || "Unknown Artist",
      genre: data.genre || "Gospel",
      audioUrl: data.audioUrl || "",
      coverUrl: data.coverUrl || "",
    };
  });
}

export async function getTrendingSongs(max = 12): Promise<Track[]> {
  const q = query(
    collection(db, "songs"),
    where("approved", "==", true),
    orderBy("plays", "desc"),
    limit(max)
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title || "Untitled Song",
      artist: data.artist || "Unknown Artist",
      genre: data.genre || "Gospel",
      audioUrl: data.audioUrl || "",
      coverUrl: data.coverUrl || "",
    };
  });
}
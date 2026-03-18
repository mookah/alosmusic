import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export type SongDoc = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  country?: string;
  audioUrl: string;
  coverUrl?: string;
  plays: number;
  createdAt?: any;
};

export async function fetchLatestSongs(max = 60): Promise<SongDoc[]> {
  try {
    const q = query(
      collection(db, "songs"),
      orderBy("createdAt", "desc"),
      limit(max)
    );

    const snap = await getDocs(q);

    return snap.docs
      .map((d) => {
        const data = d.data() as any;

        return {
          id: d.id,
          title: data.title || "Untitled",
          artist: data.artist || "Unknown Artist",
          genre: data.genre || "",
          country: data.country || "",
          audioUrl: data.audioUrl || "",
          coverUrl: data.coverUrl || "",
          plays: typeof data.plays === "number" ? data.plays : 0,
          createdAt: data.createdAt || null,
        } as SongDoc;
      })
      .filter((s) => !!s.audioUrl);
  } catch (error) {
    console.error("fetchLatestSongs error:", error);
    return [];
  }
}
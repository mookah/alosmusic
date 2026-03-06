import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type SongDoc = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  audioUrl: string;
  coverUrl?: string;
  plays?: number;
  createdAt?: any;
};

export async function fetchLatestSongs(max = 60): Promise<SongDoc[]> {
  const q = query(collection(db, "songs"), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);

  return snap.docs
    .map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title || "Untitled",
        artist: data.artist || "Unknown Artist",
        genre: data.genre || "",
        audioUrl: data.audioUrl || "",
        coverUrl: data.coverUrl || "",
        plays: data.plays ?? 0,
        createdAt: data.createdAt,
      } as SongDoc;
    })
    .filter((s) => !!s.audioUrl);
}
"use client";
import { setNowPlaying } from "@/lib/playerStore";
import { useEffect, useState } from "react";
import SiteShell from "@/components/Site/SiteShell";
import { fetchLatestSongs, SongDoc } from "@/lib/song";

function formatPlays(n: number) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function playSong(song: SongDoc) {
  // ✅ Send to BottomPlayer
  window.dispatchEvent(
    new CustomEvent("alos:play", {
      detail: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        genre: song.genre || "",
        audioUrl: song.audioUrl,
        coverUrl: song.coverUrl || "",
      },
    })
  );
}

export default function BrowsePage() {
  const [songs, setSongs] = useState<SongDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchLatestSongs(80);
        if (alive) setSongs(list);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <SiteShell title="Browse">
      <div className="pb-24">
        {loading ? (
          <div className="text-white/60">Loading songs…</div>
        ) : songs.length === 0 ? (
          <div className="text-white/60">
            No songs yet. Go to <span className="text-white">Upload</span> and add your first song.
          </div>
        ) : (
          <div className="space-y-3">
            {songs.map((s) => (
              <button
                key={s.id}
                onClick={() => playSong(s)}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 flex items-center gap-4"
              >
                {/* Cover */}
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-white/10 bg-black/40 shrink-0">
                  {s.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.coverUrl} alt={s.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-white/30 text-xs">♪</div>
                  )}
                </div>

                {/* Title/Artist */}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{s.title}</div>
                  <div className="text-sm text-white/60 truncate">
                    {s.artist}
                    {s.genre ? ` • ${s.genre}` : ""}
                  </div>
                </div>

                {/* Plays + Play btn */}
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs text-white/40">{formatPlays(s.plays ?? 0)} plays</span>
                  <span className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold">
                    Play
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
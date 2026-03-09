"use client";

type SongCardTrack = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverURL?: string;
  audioURL?: string;
};

export default function SongCard({ track }: { track: SongCardTrack }) {
  const cover = track.coverURL || "/default-cover.jpg";

  function handlePlay() {
    if (typeof window === "undefined") return;

    localStorage.setItem("alosmusic_active_song", track.id);
    window.dispatchEvent(new Event("alos:active-song-changed"));

    window.dispatchEvent(
      new CustomEvent("alos:play", {
        detail: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          genre: track.genre,
          coverURL: track.coverURL || "",
          audioURL: track.audioURL || "",
          queue: [track],
          startIndex: 0,
        },
      })
    );
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition hover:border-fuchsia-500/30">
      <div className="relative">
        <img
          src={cover}
          alt={track.title}
          className="h-40 w-full object-cover"
        />

        <button
          type="button"
          onClick={handlePlay}
          className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white transition hover:bg-fuchsia-600"
        >
          ▶ Play
        </button>
      </div>

      <div className="p-3">
        <div className="truncate text-sm font-semibold text-white">
          {track.title}
        </div>

        <div className="truncate text-xs text-white/60">
          {track.artist}
        </div>
      </div>
    </div>
  );
}
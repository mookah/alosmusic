{songs.map((song) => {
  const songCover = song.coverURL || song.coverUrl || "";
  const isCurrentSong = activeSongId === song.id;

  return (
    <div
      key={song.id}
      className={`group overflow-hidden rounded-[24px] border bg-black/25 transition duration-300 ${
        isCurrentSong
          ? "border-fuchsia-500/70 shadow-[0_0_30px_rgba(217,70,239,0.25)] ring-1 ring-fuchsia-400/40 scale-[1.01]"
          : "border-white/10 hover:bg-white/[0.04]"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
        {songCover ? (
          <img
            src={songCover}
            alt={song.title || "Song cover"}
            className={`h-full w-full object-cover transition duration-500 ${
              isCurrentSong ? "scale-105" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-4xl text-white/20">
            ♫
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {isCurrentSong && (
          <>
            <div className="absolute right-3 top-3 rounded-full bg-fuchsia-500 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
              Playing
            </div>

            <div className="absolute left-3 top-3 flex h-8 items-end gap-1 rounded-full bg-black/45 px-2 backdrop-blur">
              <span className="h-2 w-1 animate-[pulse_0.9s_ease-in-out_infinite] rounded-full bg-fuchsia-400" />
              <span className="h-4 w-1 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-purple-400" />
              <span className="h-3 w-1 animate-[pulse_0.8s_ease-in-out_infinite] rounded-full bg-pink-400" />
            </div>
          </>
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-4">
          <div className="line-clamp-1 text-lg font-semibold text-white">
            {song.title || "Untitled Song"}
          </div>
          <div className="mt-1 text-xs text-white/65">
            {song.genre || artist.genre || "Gospel"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="text-xs text-white/55">
          {Number(song.plays || 0)} streams
        </div>

        <button
          type="button"
          onClick={() => handlePlay(song)}
          className={`relative z-10 rounded-full px-3 py-1.5 text-xs transition ${
            isCurrentSong
              ? "border border-fuchsia-400/40 bg-fuchsia-500 text-white"
              : "border border-white/10 bg-white/[0.05] text-white/80 hover:bg-white/[0.1]"
          }`}
        >
          {isCurrentSong ? "Playing" : "Play"}
        </button>
      </div>
    </div>
  );
})}
<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
  <div className="h-44 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/10 to-pink-600/20" />

  <div className="px-6 pb-6">
    <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex items-end gap-4">
        <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-black bg-white/10">
          {photoURL ? (
            <img
              src={photoURL}
              alt={name || "Artist"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl text-white/40">
              🎤
            </div>
          )}
        </div>

        <div className="pb-2">
          <h1 className="text-3xl font-bold text-white">
            {name || "Gospel Artist"}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {songCount} Songs • {totalStreams} Streams
          </p>
          {bio && (
            <p className="mt-2 max-w-xl text-sm text-white/65">
              {bio}
            </p>
          )}
        </div>
      </div>

      <Link
        href="/profile/edit"
        className="inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
      >
        Edit Profile
      </Link>
    </div>
  </div>
</div>
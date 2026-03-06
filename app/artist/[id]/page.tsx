import SiteShell from "@/components/Site/SiteShell";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const artistRef = doc(db, "artists", id);
  const artistSnap = await getDoc(artistRef);

  if (!artistSnap.exists()) {
    return (
      <SiteShell title="Artist Not Found">
        <div className="text-white/70">Artist not found.</div>
      </SiteShell>
    );
  }

  const artist = artistSnap.data();

  const songsSnap = await getDocs(
    query(collection(db, "songs"), where("uid", "==", id))
  );

  const songs = songsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return (
    <SiteShell title={artist.stageName || "Artist"} showTitle={false}>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="h-56 w-full bg-black/20">
          {artist.coverURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artist.coverURL}
              alt={artist.stageName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-purple-700/40 to-blue-600/30" />
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {artist.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist.photoURL}
                  alt={artist.stageName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-white/30 text-2xl">
                  ♪
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {artist.stageName || "Artist"}
              </h1>
              <p className="mt-1 text-white/60">
                {artist.genre || "Gospel"}
                {artist.location ? ` • ${artist.location}` : ""}
              </p>
            </div>
          </div>

          {artist.bio ? (
            <p className="mt-6 max-w-3xl text-white/75">{artist.bio}</p>
          ) : null}

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Songs</h2>

            {songs.length === 0 ? (
              <p className="mt-3 text-white/60">No songs uploaded yet.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {songs.map((song: any) => (
                  <div
                    key={song.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="font-semibold">{song.title}</div>
                    <div className="text-sm text-white/60">
                      {song.genre || "Gospel"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
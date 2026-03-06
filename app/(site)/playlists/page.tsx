import SiteShell from "@/components/Site/SiteShell";
import { PLAYLISTS } from "@/components/Site/mockData";

export default function PlaylistsPage() {
  return (
    <SiteShell title="Playlists">
      <div className="mb-5 flex flex-wrap gap-2">
        {["Afropop", "Afrobeats", "Gospel", "Pop", "Jazz", "Reggae"].map((g) => (
          <Chip key={g} label={g} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
        {PLAYLISTS.map((p) => (
          <div key={p.title} className="group">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/20 to-indigo-500/25" />
              <div className="absolute bottom-3 left-3 text-xs text-white/80">
                ▶ {p.plays}
              </div>
            </div>
            <div className="mt-3 line-clamp-2 font-medium group-hover:text-white">
              {p.title}
            </div>
          </div>
        ))}
      </div>
    </SiteShell>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
      {label}
    </button>
  );
}
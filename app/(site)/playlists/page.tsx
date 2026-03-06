import SiteShell from "@/components/Site/SiteShell";
import { PLAYLISTS } from "@/components/site/mockData";

export default function PlaylistsPage() {
  return (
    <SiteShell title="Playlists">
      <div className="flex flex-wrap gap-2 mb-5">
        {["Afropop", "Afrobeats", "Gospel", "Pop", "Jazz", "Reggae"].map((g) => (
          <Chip key={g} label={g} />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {PLAYLISTS.map((p) => (
          <div key={p.title} className="group">
            <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/25 via-fuchsia-500/20 to-indigo-500/25" />
              <div className="absolute bottom-3 left-3 text-xs text-white/80">▶ {p.plays}</div>
            </div>
            <div className="mt-3 font-medium group-hover:text-white line-clamp-2">{p.title}</div>
          </div>
        ))}
      </div>
    </SiteShell>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <button className="rounded-full px-4 py-2 text-sm border bg-white/5 text-white/80 border-white/10 hover:bg-white/10">
      {label}
    </button>
  );
}
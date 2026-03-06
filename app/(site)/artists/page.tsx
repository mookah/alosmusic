import SiteShell from "@/components/Site/SiteShell";

export default function ArtistsPage() {
  return (
    <SiteShell title="Artists">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-white/70 text-sm mb-4">
          This will become your artists grid (A–Z + filters).
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Levi Mukanah", "Pompi", "Esther Chungu", "Kings Malembe", "Yo Maps", "Chef 187"].map(
            (name) => (
              <div
                key={name}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-white/5 transition"
              >
                <div className="h-12 w-12 rounded-2xl bg-white/10 grid place-items-center mb-3">
                  👤
                </div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-white/60 mt-1">View songs</div>
              </div>
            )
          )}
        </div>
      </div>
    </SiteShell>
  );
}
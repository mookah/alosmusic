import SiteShell from "@/components/Site/SiteShell";

export default function TrendingPage() {
  return (
    <SiteShell title="Trending">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-white/70 text-sm mb-4">
          This will become your Boomplay-style trending list (table view).
        </p>

        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center">
                  🔥
                </div>
                <div>
                  <div className="font-medium">Trending Song #{i + 1}</div>
                  <div className="text-xs text-white/60">Artist name • 3:12</div>
                </div>
              </div>

              <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition">
                Play
              </button>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
import SiteShell from "@/components/Site/SiteShell";
import { CHARTS_WEEKLY } from "@/components/Site/mockData";

export default function ChartsPage() {
  return (
    <SiteShell title="Charts">
      <h2 className="mb-4 text-lg font-semibold">Weekly Charts</h2>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
        {CHARTS_WEEKLY.map((c) => (
          <div key={c.title} className="group">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-orange-500/20 to-indigo-500/20" />
              <div className="absolute bottom-3 left-3 right-3 text-xs text-white/80">
                🎧 {c.listeners}
              </div>
            </div>
            <div className="mt-3 font-medium group-hover:text-white">{c.title}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">Daily Charts</h2>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {[
          "Daily 100 Zambia",
          "Daily Rising",
          "Daily 100 Africa",
          "Daily 100 Christian & Gospel",
        ].map((t) => (
          <div
            key={t}
            className="aspect-[4/3] rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="h-full w-full rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-indigo-500/20" />
            <div className="mt-3 font-medium">{t}</div>
          </div>
        ))}
      </div>
    </SiteShell>
  );
}
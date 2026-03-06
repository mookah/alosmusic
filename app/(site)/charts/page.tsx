import SiteShell from "@/components/Site/SiteShell";
import { CHARTS_WEEKLY } from "@/components/site/mockData";

export default function ChartsPage() {
  return (
    <SiteShell title="Charts">
      <h2 className="text-lg font-semibold mb-4">Weekly Charts</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {CHARTS_WEEKLY.map((c) => (
          <div key={c.title} className="group">
            <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-orange-500/20 to-indigo-500/20" />
              <div className="absolute bottom-3 left-3 right-3 text-xs text-white/80">
                🎧 {c.listeners}
              </div>
            </div>
            <div className="mt-3 font-medium group-hover:text-white">{c.title}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-10 mb-4">Daily Charts</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {["Daily 100 Zambia", "Daily Rising", "Daily 100 Africa", "Daily 100 Christian & Gospel"].map((t) => (
          <div key={t} className="aspect-[4/3] rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="h-full w-full rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-indigo-500/20" />
            <div className="mt-3 font-medium">{t}</div>
          </div>
        ))}
      </div>
    </SiteShell>
  );
}
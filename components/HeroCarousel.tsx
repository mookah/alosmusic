"use client";

import { useEffect, useMemo, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const safe = useMemo(() => slides ?? [], [slides]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!safe.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % safe.length), 5500);
    return () => clearInterval(t);
  }, [safe.length]);

  if (!safe.length) return null;

  const s = safe[i];

  return (
    <section className="mt-6">
      <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.image}
          alt={s.title}
          className="h-[240px] md:h-[320px] w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
          <div className="inline-flex items-center gap-2 text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1 w-fit">
            🎧 Gospel Music Platform
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl">
            {s.title}
          </h1>
          <p className="mt-2 text-white/75 max-w-2xl">{s.subtitle}</p>

          <div className="mt-5 flex gap-3">
            <button className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold hover:brightness-110">
              Browse Music
            </button>
            <button className="rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/10">
              Upload a Song
            </button>
          </div>
        </div>

        {/* dots */}
        <div className="absolute bottom-4 right-5 flex gap-2">
          {safe.map((x, idx) => (
            <button
              key={x.id}
              onClick={() => setI(idx)}
              className={[
                "h-2.5 w-2.5 rounded-full border border-white/30",
                idx === i ? "bg-white/80" : "bg-white/10",
              ].join(" ")}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
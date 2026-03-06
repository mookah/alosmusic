"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  href?: string;
  badge?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function BoomplayHero({
  slides,
  intervalMs = 4500,
  className = "",
}: {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
}) {
  const safeSlides = useMemo(() => slides?.filter(Boolean) ?? [], [slides]);
  const count = safeSlides.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // drag/swipe
  const dragging = useRef(false);
  const startX = useRef(0);
  const dx = useRef(0);

  const go = (next: number) => {
    if (!count) return;
    setIndex((next + count) % count);
  };
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  useEffect(() => {
    if (!count || paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(t);
  }, [count, paused, intervalMs]);

  if (!count) return null;

  // “peeking” layout
  const peek = 14; // percentage of next/prev peeking
  const translate = index * 100;

  return (
    <section className={`w-full ${className}`}>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={(e) => {
          dragging.current = true;
          startX.current = e.clientX;
          dx.current = 0;
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          dx.current = e.clientX - startX.current;
        }}
        onPointerUp={() => {
          if (!dragging.current) return;
          dragging.current = false;
          const dist = dx.current;
          dx.current = 0;

          if (dist > 60) prev();
          else if (dist < -60) next();
        }}
      >
        {/* Outer glow */}
        <div className="absolute -inset-6 opacity-80 blur-2xl pointer-events-none [background:radial-gradient(800px_circle_at_20%_30%,rgba(236,72,153,0.25),transparent_60%),radial-gradient(900px_circle_at_70%_70%,rgba(168,85,247,0.22),transparent_60%),radial-gradient(700px_circle_at_60%_20%,rgba(59,130,246,0.18),transparent_60%)]" />

        {/* Viewport */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black">
          {/* Track */}
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(calc(-${translate}% + ${peek}%))`,
              width: `${count * 100}%`,
            }}
          >
            {safeSlides.map((s, i) => {
              const active = i === index;
              return (
                <div
                  key={s.id}
                  className="relative"
                  style={{ width: `${100 / count}%` }}
                >
                  {/* Slide card */}
                  <div
                    className={`mx-3 my-3 rounded-[24px] overflow-hidden border border-white/10 bg-white/5 transition-all duration-700 ${
                      active ? "opacity-100 scale-[1]" : "opacity-70 scale-[0.98]"
                    }`}
                  >
                    <div className="relative h-[190px] sm:h-[230px] md:h-[270px]">
                      <Image
                        src={s.imageUrl}
                        alt={s.title}
                        fill
                        className="object-cover"
                        priority={active}
                      />

                      {/* overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
                      <div className="absolute inset-0 opacity-70 [background:radial-gradient(600px_circle_at_25%_30%,rgba(236,72,153,0.25),transparent_60%),radial-gradient(600px_circle_at_70%_70%,rgba(168,85,247,0.22),transparent_60%)]" />

                      {/* badge */}
                      {s.badge ? (
                        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-white/90 backdrop-blur">
                          {s.badge}
                        </div>
                      ) : null}

                      {/* text */}
                      <div className="absolute inset-0 flex items-end p-5 sm:p-6">
                        <div className="max-w-[78%]">
                          <div className="text-lg sm:text-2xl font-semibold leading-tight">
                            {s.title}
                          </div>
                          {s.subtitle ? (
                            <div className="mt-1 text-sm sm:text-base text-white/75">
                              {s.subtitle}
                            </div>
                          ) : null}

                          {s.href ? (
                            <a
                              href={s.href}
                              className="inline-flex mt-3 items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm"
                            >
                              Listen now <span aria-hidden>→</span>
                            </a>
                          ) : (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-white/80">
                              Featured
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 hover:bg-black/70 px-3 py-2 text-white/90 backdrop-blur"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 hover:bg-black/70 px-3 py-2 text-white/90 backdrop-blur"
            aria-label="Next"
          >
            ›
          </button>
        </div>

        {/* dots + progress */}
        <div className="mt-3 flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2">
            {safeSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index
                    ? "w-9 bg-white/80"
                    : "w-2.5 bg-white/25 hover:bg-white/35"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="text-xs text-white/55">
            {index + 1} / {count}
          </div>
        </div>
      </div>
    </section>
  );
}
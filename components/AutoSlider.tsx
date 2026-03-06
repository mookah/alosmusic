"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  href?: string;
};

export default function AutoSlider({
  slides,
  intervalMs = 4500,
  className = "",
}: {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Touch swipe
  const startX = useRef<number | null>(null);
  const deltaX = useRef<number>(0);

  const safeSlides = useMemo(() => slides?.filter(Boolean) ?? [], [slides]);
  const count = safeSlides.length;

  const go = (next: number) => {
    if (!count) return;
    const wrapped = (next + count) % count;
    setIndex(wrapped);
  };

  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  useEffect(() => {
    if (!count) return;
    if (paused) return;

    const t = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);

    return () => clearInterval(t);
  }, [count, paused, intervalMs]);

  if (!count) return null;

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
        deltaX.current = 0;
      }}
      onTouchMove={(e) => {
        if (startX.current == null) return;
        deltaX.current = e.touches[0].clientX - startX.current;
      }}
      onTouchEnd={() => {
        const dx = deltaX.current;
        startX.current = null;
        deltaX.current = 0;

        // swipe threshold
        if (dx > 50) prev();
        else if (dx < -50) next();
      }}
    >
      {/* Slide viewport */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {safeSlides.map((s) => (
            <div key={s.id} className="relative min-w-full">
              {/* Image */}
              <div className="relative h-[180px] sm:h-[220px] md:h-[260px]">
                <Image
                  src={s.imageUrl}
                  alt={s.title}
                  fill
                  className="object-cover"
                  priority={false}
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
                {/* Soft glow overlay */}
                <div className="absolute inset-0 opacity-60 [background:radial-gradient(600px_circle_at_20%_30%,rgba(168,85,247,0.35),transparent_60%),radial-gradient(600px_circle_at_70%_70%,rgba(59,130,246,0.25),transparent_60%)]" />
              </div>

              {/* Text */}
              <div className="absolute inset-0 flex items-end p-5 sm:p-6">
                <div className="max-w-[70%]">
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
                      Listen now
                      <span aria-hidden>→</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 hover:bg-black/70 px-3 py-2 text-white/90"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 hover:bg-black/70 px-3 py-2 text-white/90"
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {safeSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-8 bg-white/80" : "w-2.5 bg-white/25 hover:bg-white/35"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
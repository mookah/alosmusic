"use client";

import { useRef, useState, useEffect } from "react";
import SongCard from "@/components/songs/SongCard";
import { Track } from "@/lib/playerStore";

export default function HotlistRow({ tracks }: { tracks: Track[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const drag = useRef({
    down: false,
    startX: 0,
    scrollLeft: 0,
  });

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;

    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < maxScroll - 5);
  }

  useEffect(() => {
    updateArrows();

    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateArrows();
    const onResize = () => updateArrows();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  function scroll(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;

    const amount = Math.min(500, el.clientWidth * 0.9);

    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  function onMouseDown(e: React.MouseEvent) {
    const el = scrollerRef.current;
    if (!el) return;

    drag.current.down = true;
    drag.current.startX = e.pageX;
    drag.current.scrollLeft = el.scrollLeft;
  }

  function onMouseMove(e: React.MouseEvent) {
    const el = scrollerRef.current;
    if (!el || !drag.current.down) return;

    const dx = e.pageX - drag.current.startX;
    el.scrollLeft = drag.current.scrollLeft - dx;
  }

  function stopDrag() {
    drag.current.down = false;
  }

  return (
    <div className="relative mt-4">

      {/* LEFT ARROW */}
      <button
        onClick={() => scroll("left")}
        className={`hidden md:grid absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/40 backdrop-blur hover:bg-black/60 transition ${
          canLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        ←
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={() => scroll("right")}
        className={`hidden md:grid absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/40 backdrop-blur hover:bg-black/60 transition ${
          canRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        →
      </button>

      {/* EDGE FADE */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/40 to-transparent rounded-l-2xl" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/40 to-transparent rounded-r-2xl" />

      {/* SONG SCROLLER */}
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-3 pr-2 scroll-smooth snap-x snap-mandatory hide-scrollbar"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseLeave={stopDrag}
        onMouseUp={stopDrag}
      >
        {tracks.map((track) => (
          <div key={track.id} className="min-w-[170px] snap-start">
            <SongCard track={track} />
          </div>
        ))}
      </div>
    </div>
  );
}
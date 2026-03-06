"use client";

export default function SeekEqualizer({
  active,
  fillPct,
}: {
  active: boolean;
  fillPct: number; // 0 - 100
}) {
  // 36 bars looks like the image
  const bars = Array.from({ length: 36 });

  return (
    <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6">
      {/* base (faint) bars across the whole seek width */}
      <div className="absolute inset-0 flex items-end gap-[2px] opacity-35">
        {bars.map((_, i) => (
          <span
            key={`base-${i}`}
            className="h-[40%] w-[6px] rounded-sm eqbar"
            style={{
              animationPlayState: active ? "running" : "paused",
              animationDelay: `${-i * 0.07}s`,
            }}
          />
        ))}
      </div>

      {/* filled bars (clipped to current progress) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${Math.max(0, Math.min(100, fillPct))}%` }}
      >
        <div className="flex items-end gap-[2px]">
          {bars.map((_, i) => (
            <span
              key={`fill-${i}`}
              className="h-[55%] w-[6px] rounded-sm eqbar eqbarFill"
              style={{
                animationPlayState: active ? "running" : "paused",
                animationDelay: `${-i * 0.07}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        /* bar motion */
        .eqbar {
          background: rgba(255, 255, 255, 0.12);
          transform-origin: bottom;
          animation: bounce 0.9s ease-in-out infinite;
          filter: blur(0px);
        }

        /* premium gradient bars for the filled portion */
        .eqbarFill {
          background: linear-gradient(
            180deg,
            rgba(236, 72, 153, 0.95),
            rgba(168, 85, 247, 0.95),
            rgba(59, 130, 246, 0.95)
          );
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.25);
          filter: saturate(1.15) brightness(1.05);
        }

        @keyframes bounce {
          0% {
            transform: scaleY(0.25);
            opacity: 0.65;
          }
          45% {
            transform: scaleY(1.25);
            opacity: 1;
          }
          100% {
            transform: scaleY(0.45);
            opacity: 0.75;
          }
        }
      `}</style>
    </div>
  );
}
"use client";

export default function LogoEqualizer({
  size = 34,
  className = "",
  showText = false,
  text = "ALOSMUSIC",
}: {
  size?: number;
  className?: string;
  showText?: boolean;
  text?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* round logo */}
      <div
        className="relative grid place-items-center rounded-2xl border border-white/10 bg-black/40 overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* glow */}
        <div className="absolute -inset-6 opacity-80 blur-2xl pointer-events-none [background:radial-gradient(18px_circle_at_30%_30%,rgba(168,85,247,0.55),transparent_60%),radial-gradient(22px_circle_at_70%_70%,rgba(59,130,246,0.35),transparent_60%)]" />

        {/* inner dot / mark */}
        <div className="relative z-[1] h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,.65)]" />

        {/* equalizer bars */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-[3px] z-[2]">
          <span className="eqbar h-2 w-[3px] rounded-full bg-white/80" />
          <span className="eqbar h-4 w-[3px] rounded-full bg-white/80 [animation-delay:-.25s]" />
          <span className="eqbar h-3 w-[3px] rounded-full bg-white/80 [animation-delay:-.4s]" />
          <span className="eqbar h-5 w-[3px] rounded-full bg-white/80 [animation-delay:-.15s]" />
        </div>
      </div>

      {showText ? (
        <div className="leading-tight">
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-white/55">Gospel • Upload • Stream</div>
        </div>
      ) : null}

      <style jsx>{`
        .eqbar {
          animation: eq 0.9s ease-in-out infinite;
          transform-origin: bottom;
          opacity: 0.9;
        }
        @keyframes eq {
          0% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }
          40% {
            transform: scaleY(1.1);
            opacity: 1;
          }
          100% {
            transform: scaleY(0.55);
            opacity: 0.75;
          }
        }
      `}</style>
    </div>
  );
}
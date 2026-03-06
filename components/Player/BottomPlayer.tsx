"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Track,
  subscribePlayer,
  setNowPlaying,
  restorePlayerFromStorage,
  updatePlayback,
} from "@/lib/playerStore";
import { incrementSongPlays } from "@/lib/songStats";

function fmtTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

let GLOBAL_AUDIO: HTMLAudioElement | null = null;
let GLOBAL_CTX: AudioContext | null = null;
let GLOBAL_ANALYSER: AnalyserNode | null = null;
let GLOBAL_SRC: MediaElementAudioSourceNode | null = null;
let GLOBAL_ATTACHED_AUDIO: HTMLAudioElement | null = null;

export default function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const countedPlayRef = useRef<string | null>(null);

  const [visible, setVisible] = useState(true);
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);

  const [seeking, setSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState(0);

  const BAR_COUNT = 34;
  const [levels, setLevels] = useState<number[]>(
    Array.from({ length: BAR_COUNT }, () => 0.12)
  );

  const progressPct = useMemo(() => {
    const d = duration || 0;
    const t = seeking ? seekPreview : currentTime;
    if (!d) return 0;
    return Math.max(0, Math.min(100, (t / d) * 100));
  }, [currentTime, duration, seeking, seekPreview]);

  async function ensureAudioGraph() {
    const a = audioRef.current;
    if (!a) return false;

    a.crossOrigin = "anonymous";

    if (!GLOBAL_CTX) GLOBAL_CTX = new AudioContext();

    if (GLOBAL_CTX.state !== "running") {
      try {
        await GLOBAL_CTX.resume();
      } catch {}
    }

    if (GLOBAL_CTX.state !== "running") return false;

    if (!GLOBAL_ANALYSER) {
      GLOBAL_ANALYSER = GLOBAL_CTX.createAnalyser();
      GLOBAL_ANALYSER.fftSize = 1024;
      GLOBAL_ANALYSER.smoothingTimeConstant = 0.85;
    }

    if (GLOBAL_SRC && GLOBAL_ATTACHED_AUDIO === a) return true;

    if (GLOBAL_ATTACHED_AUDIO && GLOBAL_ATTACHED_AUDIO !== a) {
      try {
        GLOBAL_SRC?.disconnect();
      } catch {}
      try {
        GLOBAL_ANALYSER?.disconnect();
      } catch {}

      GLOBAL_SRC = null;
      GLOBAL_ATTACHED_AUDIO = null;

      GLOBAL_ANALYSER = GLOBAL_CTX.createAnalyser();
      GLOBAL_ANALYSER.fftSize = 1024;
      GLOBAL_ANALYSER.smoothingTimeConstant = 0.85;
    }

    try {
      GLOBAL_SRC = GLOBAL_CTX.createMediaElementSource(a);
      GLOBAL_ATTACHED_AUDIO = a;

      GLOBAL_SRC.connect(GLOBAL_ANALYSER);
      GLOBAL_ANALYSER.connect(GLOBAL_CTX.destination);

      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (!GLOBAL_AUDIO) {
      GLOBAL_AUDIO = new Audio();
      GLOBAL_AUDIO.preload = "metadata";
    }

    const a = GLOBAL_AUDIO;
    audioRef.current = a;

    const snap = restorePlayerFromStorage();
    setTrack(snap.track);
    setIsPlaying(!!snap.isPlaying);
    setCurrentTime(Number(snap.currentTime || a.currentTime || 0));
    setDuration(Number(snap.duration || a.duration || 0));
    setVolume(typeof snap.volume === "number" ? snap.volume : 0.85);
    setMuted(!!snap.muted);

    a.volume = typeof snap.volume === "number" ? snap.volume : 0.85;
    a.muted = !!snap.muted;

    const onPlay = () => {
      setIsPlaying(true);
      updatePlayback({ isPlaying: true });
    };

    const onPause = () => {
      setIsPlaying(false);
      updatePlayback({ isPlaying: false });
    };

    const onLoaded = () => {
      const d = a.duration || 0;
      setDuration(d);
      updatePlayback({ duration: d });
    };

    const onTime = () => {
      const t = a.currentTime || 0;
      if (!seeking) setCurrentTime(t);
      updatePlayback({ currentTime: t });
    };

    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);

    const unsub = subscribePlayer((s) => {
      setTrack(s.track);
      setVisible(true);
      setIsPlaying(!!s.isPlaying);
      setCurrentTime(Number(s.currentTime || 0));
      setDuration(Number(s.duration || 0));
      setVolume(typeof s.volume === "number" ? s.volume : 0.85);
      setMuted(!!s.muted);
    });

    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      unsub();
    };
  }, [seeking]);

  useEffect(() => {
    if (!track?.id || !isPlaying) return;
    if (countedPlayRef.current === track.id) return;

    countedPlayRef.current = track.id;
    incrementSongPlays(track.id);
  }, [track?.id, isPlaying]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = Math.max(0, Math.min(1, volume));
    updatePlayback({ volume });
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
    updatePlayback({ muted });
  }, [muted]);

  useEffect(() => {
    const tick = () => {
      if (!GLOBAL_ANALYSER) {
        if (!isPlaying) {
          setLevels((prev) => prev.map((p) => 0.85 * p + 0.15 * 0.12));
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const freq = new Uint8Array(GLOBAL_ANALYSER.frequencyBinCount);
      GLOBAL_ANALYSER.getByteFrequencyData(freq);

      const next: number[] = [];
      const n = freq.length;

      for (let i = 0; i < BAR_COUNT; i++) {
        const start = Math.floor((i / BAR_COUNT) * n);
        const end = Math.floor(((i + 1) / BAR_COUNT) * n);
        let sum = 0;
        let count = 0;

        for (let j = start; j < end; j++) {
          sum += freq[j] || 0;
          count++;
        }

        const avg = count ? sum / count : 0;
        const v = clamp01((avg / 255) * 1.15);
        next.push(0.12 + v * 0.88);
      }

      if (!isPlaying) {
        setLevels((prev) => prev.map((p) => 0.85 * p + 0.15 * 0.12));
      } else {
        setLevels(next);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track?.audioUrl) return;

    if (a.src === track.audioUrl) return;

    a.src = track.audioUrl;

    const s = restorePlayerFromStorage();
    const startAt = s.track?.audioUrl === track.audioUrl ? s.currentTime : 0;

    a.currentTime = Math.max(0, startAt || 0);
    setCurrentTime(a.currentTime);
    setDuration(a.duration || 0);

    a.play().catch(() => setIsPlaying(false));
  }, [track?.audioUrl]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Track>;
      const t = customEvent.detail;

      if (!t?.audioUrl) return;

      setNowPlaying(t);
      updatePlayback({
        track: t,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      });

      setTrack(t);
      setVisible(true);
    };

    window.addEventListener("alos:play", handler as EventListener);
    return () => window.removeEventListener("alos:play", handler as EventListener);
  }, []);

  const play = async () => {
    await ensureAudioGraph();
    const a = audioRef.current;
    if (!a) return;

    try {
      await a.play();
    } catch {}
  };

  const pause = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
  };

  const close = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      a.src = "";
    }

    countedPlayRef.current = null;
    setNowPlaying(null);
    updatePlayback({
      track: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });

    setTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVisible(false);
  };

  const seekTo = (t: number) => {
    const a = audioRef.current;
    if (!a || !duration) return;

    a.currentTime = Math.max(0, Math.min(duration, t));
    setCurrentTime(a.currentTime);
    updatePlayback({ currentTime: a.currentTime });
  };

  if (!visible) return null;

  const showPremium = !!track?.audioUrl;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-[60] border-t border-white/10 bg-black/75 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* Top row on mobile / left side on desktop */}
          <div className="flex min-w-0 items-center gap-3 md:w-[320px] md:shrink-0">
            <div className="relative shrink-0">
              {showPremium && (
                <>
                  <div
                    className={`absolute -inset-2 rounded-2xl blur-xl opacity-70 ${
                      isPlaying ? "animate-[alosGlow_1.8s_ease-in-out_infinite]" : ""
                    }`}
                    style={{
                      background:
                        "radial-gradient(120px circle at 50% 50%, rgba(236,72,153,.32), rgba(168,85,247,.28), rgba(59,130,246,.22), transparent 65%)",
                    }}
                  />
                  <div
                    className={`absolute -inset-[3px] rounded-2xl ${
                      isPlaying ? "animate-[alosRing_2.2s_linear_infinite]" : ""
                    }`}
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(236,72,153,.9), rgba(168,85,247,.9), rgba(59,130,246,.9))",
                      opacity: 0.35,
                      filter: "blur(0px)",
                      maskImage:
                        "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
                      WebkitMaskImage:
                        "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
                      padding: "2px",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }}
                  />
                </>
              )}

              <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-14 sm:w-14">
                {track?.coverUrl ? (
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs text-white/30">
                    ♪
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold sm:text-[15px]">
                {track?.title || "Select a song"}
              </div>

              <div className="truncate text-xs text-white/60 sm:text-sm">
                {track
                  ? `${track.artist}${track.genre ? ` • ${track.genre}` : ""}`
                  : "Go to Browse and click Play"}
              </div>
            </div>

            <button
              onClick={close}
              className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 md:hidden"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Middle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 shrink-0 text-right text-[11px] text-white/50">
                {fmtTime(seeking ? seekPreview : currentTime)}
              </div>

              <div className="relative flex-1 overflow-visible">
                <div className="pointer-events-none absolute -top-5 left-0 right-0 h-5 sm:-top-6 sm:h-6">
                  <div className="flex h-full items-end gap-[1.5px] sm:gap-[2px]">
                    {levels.map((lv, i) => (
                      <span
                        key={i}
                        className="w-[4px] rounded-sm sm:w-[6px]"
                        style={{
                          height: `${Math.round(lv * 100)}%`,
                          background:
                            "linear-gradient(180deg, rgba(236,72,153,.95), rgba(168,85,247,.95), rgba(59,130,246,.95))",
                          opacity: i / levels.length <= progressPct / 100 ? 1 : 0.22,
                          boxShadow:
                            i / levels.length <= progressPct / 100
                              ? "0 0 14px rgba(168,85,247,.22)"
                              : "none",
                          filter: "saturate(1.2) brightness(1.05)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="relative h-2 cursor-pointer overflow-hidden rounded-full bg-white/10"
                  onMouseDown={(e) => {
                    if (!duration) return;
                    setSeeking(true);
                    const rect = (
                      e.currentTarget as HTMLDivElement
                    ).getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    setSeekPreview(Math.max(0, Math.min(duration, pct * duration)));
                  }}
                  onMouseMove={(e) => {
                    if (!seeking || !duration) return;
                    const rect = (
                      e.currentTarget as HTMLDivElement
                    ).getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    setSeekPreview(Math.max(0, Math.min(duration, pct * duration)));
                  }}
                  onMouseUp={() => {
                    if (!duration) return;
                    setSeeking(false);
                    seekTo(seekPreview);
                  }}
                  onMouseLeave={() => seeking && setSeeking(false)}
                  onTouchStart={(e) => {
                    if (!duration) return;
                    setSeeking(true);
                    const touch = e.touches[0];
                    const rect = (
                      e.currentTarget as HTMLDivElement
                    ).getBoundingClientRect();
                    const pct = (touch.clientX - rect.left) / rect.width;
                    setSeekPreview(Math.max(0, Math.min(duration, pct * duration)));
                  }}
                  onTouchMove={(e) => {
                    if (!duration) return;
                    const touch = e.touches[0];
                    const rect = (
                      e.currentTarget as HTMLDivElement
                    ).getBoundingClientRect();
                    const pct = (touch.clientX - rect.left) / rect.width;
                    setSeekPreview(Math.max(0, Math.min(duration, pct * duration)));
                  }}
                  onTouchEnd={() => {
                    if (!duration) return;
                    setSeeking(false);
                    seekTo(seekPreview);
                  }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-purple-500 transition-[width] duration-150"
                    style={{ width: `${progressPct}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(168,85,247,.8)]"
                    style={{ left: `calc(${progressPct}% - 6px)` }}
                  />
                </div>
              </div>

              <div className="w-10 shrink-0 text-[11px] text-white/50">
                {fmtTime(duration)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <button
                  onClick={pause}
                  className="relative overflow-hidden rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500 sm:px-5"
                >
                  <span className="absolute -inset-3 rounded-2xl opacity-60 blur-xl pointer-events-none [background:radial-gradient(120px_circle_at_50%_50%,rgba(168,85,247,0.45),transparent_60%)]" />
                  <span className="relative inline-flex items-center gap-2">
                    <span className="inline-flex h-4 items-end gap-[2px]">
                      <span className="alosBtnBar alosBtnBar1" />
                      <span className="alosBtnBar alosBtnBar2" />
                      <span className="alosBtnBar alosBtnBar3" />
                      <span className="alosBtnBar alosBtnBar4" />
                    </span>
                    Pause
                  </span>
                </button>
              ) : (
                <button
                  onClick={play}
                  className="relative overflow-hidden rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500 sm:px-5"
                >
                  <span className="absolute -inset-3 rounded-2xl opacity-60 blur-xl pointer-events-none [background:radial-gradient(120px_circle_at_50%_50%,rgba(168,85,247,0.45),transparent_60%)]" />
                  <span className="relative inline-flex items-center gap-2">
                    <span className="inline-flex h-4 items-end gap-[2px] opacity-80">
                      <span className="alosBtnBar alosBtnBar1" />
                      <span className="alosBtnBar alosBtnBar2" />
                      <span className="alosBtnBar alosBtnBar3" />
                      <span className="alosBtnBar alosBtnBar4" />
                    </span>
                    Play
                  </span>
                </button>
              )}

              <button
                onClick={close}
                className="hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 md:inline-flex"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => setMuted((m) => !m)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                title="Mute"
              >
                {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔈" : "🔊"}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (v > 0) setMuted(false);
                }}
                className="w-28 accent-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes alosGlow {
          0% {
            transform: scale(0.98);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.85;
          }
          100% {
            transform: scale(0.98);
            opacity: 0.55;
          }
        }

        @keyframes alosRing {
          0% {
            transform: rotate(0deg);
            opacity: 0.25;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.25;
          }
        }

        .alosBtnBar {
          width: 4px;
          border-radius: 3px;
          background: linear-gradient(
            180deg,
            rgba(236, 72, 153, 0.95),
            rgba(168, 85, 247, 0.95),
            rgba(59, 130, 246, 0.95)
          );
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
          height: 40%;
          animation: alosBtnEQ 0.9s ease-in-out infinite;
        }

        .alosBtnBar1 {
          animation-delay: 0ms;
        }

        .alosBtnBar2 {
          animation-delay: 120ms;
        }

        .alosBtnBar3 {
          animation-delay: 240ms;
        }

        .alosBtnBar4 {
          animation-delay: 360ms;
        }

        @keyframes alosBtnEQ {
          0% {
            height: 30%;
            opacity: 0.75;
          }
          30% {
            height: 95%;
            opacity: 1;
          }
          60% {
            height: 45%;
            opacity: 0.9;
          }
          100% {
            height: 70%;
            opacity: 0.95;
          }
        }
      `}</style>
    </div>
  );
}
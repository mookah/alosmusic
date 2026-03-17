"use client";

import { incrementSongPlays } from "@/lib/songStats";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverURL?: string;
  coverUrl?: string;
  audioURL?: string;
  audioUrl?: string;
};

type PlayEventDetail = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverURL?: string;
  coverUrl?: string;
  audioURL?: string;
  audioUrl?: string;
  queue?: Track[];
  startIndex?: number;
};

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function normalizeTrack(item: Track): Track {
  const cover = (item.coverURL || item.coverUrl || "").trim();
  const audio = (item.audioURL || item.audioUrl || "").trim();

  return {
    ...item,
    coverURL: cover,
    coverUrl: cover,
    audioURL: audio,
    audioUrl: audio,
  };
}

export default function BottomPlayer() {
  const pathname = usePathname();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(-1);
  const countedCurrentTrackRef = useRef(false);

  const [track, setTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [showPlayer, setShowPlayer] = useState(true);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  const nextUp = useMemo(() => {
    if (!queue.length || currentIndex < 0) return [];
    const afterCurrent = queue.slice(currentIndex + 1);
    const beforeCurrent = queue.slice(0, currentIndex);
    return [...afterCurrent, ...beforeCurrent];
  }, [queue, currentIndex]);

  const notifyActiveSong = useCallback((songId: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("alosmusic_active_song", songId);
    window.dispatchEvent(new Event("alos:active-song-changed"));
  }, []);

  const playTrack = useCallback(
    async (nextTrack: Track, list: Track[], index: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const normalizedQueue = list.map(normalizeTrack);
      const safeIndex =
        index >= 0 && index < normalizedQueue.length ? index : 0;
      const selectedTrack =
        normalizedQueue[safeIndex] || normalizeTrack(nextTrack);
      const src = (selectedTrack.audioURL || selectedTrack.audioUrl || "").trim();

      console.log("TRACK RECEIVED:", selectedTrack);
      console.log("AUDIO SRC RAW:", JSON.stringify(src));

      if (!src) {
        console.error("Missing audio source:", selectedTrack);
        setIsPlaying(false);
        return;
      }

      try {
        countedCurrentTrackRef.current = false;

        setTrack(selectedTrack);
        setQueue(normalizedQueue);
        setCurrentIndex(safeIndex);

        trackRef.current = selectedTrack;
        queueRef.current = normalizedQueue;
        currentIndexRef.current = safeIndex;

        setCurrentTime(0);
        setDuration(0);
        setShowPlayer(true);

        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");
        audio.load();

        audio.src = src;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }

        setIsPlaying(true);
        notifyActiveSong(selectedTrack.id);
      } catch (error) {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      }
    },
    [notifyActiveSong]
  );

  const handleNext = useCallback(() => {
    const list = queueRef.current;
    const index = currentIndexRef.current;

    if (!list.length) return;

    const nextIndex = index + 1 >= list.length ? 0 : index + 1;
    playTrack(list[nextIndex], list, nextIndex);
  }, [playTrack]);

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    const list = queueRef.current;
    const index = currentIndexRef.current;

    if (!list.length) return;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevIndex = index - 1 < 0 ? list.length - 1 : index - 1;
    playTrack(list[prevIndex], list, prevIndex);
  }, [playTrack]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !trackRef.current) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayer(true);
        })
        .catch((error) => {
          console.error("Resume failed:", error);
          setIsPlaying(false);
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);

      const activeTrack = trackRef.current;
      if (
        activeTrack?.id &&
        !countedCurrentTrackRef.current &&
        audio.currentTime >= 5
      ) {
        countedCurrentTrackRef.current = true;
        incrementSongPlays(activeTrack.id);
      }
    };

    const updateDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      const list = queueRef.current;
      const index = currentIndexRef.current;

      countedCurrentTrackRef.current = false;

      if (!list.length) {
        setIsPlaying(false);
        return;
      }

      const nextIndex = index + 1 >= list.length ? 0 : index + 1;
      playTrack(list[nextIndex], list, nextIndex);
    };

    const onError = () => {
      const mediaError = audio.error;
      console.error("Audio failed to load:", {
        src: JSON.stringify(audio.src),
        code: mediaError?.code,
        message:
          mediaError?.code === 1
            ? "MEDIA_ERR_ABORTED"
            : mediaError?.code === 2
            ? "MEDIA_ERR_NETWORK"
            : mediaError?.code === 3
            ? "MEDIA_ERR_DECODE"
            : mediaError?.code === 4
            ? "MEDIA_ERR_SRC_NOT_SUPPORTED"
            : "Unknown media error",
        networkState: audio.networkState,
        readyState: audio.readyState,
      });
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("canplay", updateDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("canplay", updateDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [playTrack, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onPlayEvent(event: Event) {
      const customEvent = event as CustomEvent<PlayEventDetail>;
      const detail = customEvent.detail;

      console.log("Received alos:play event:", detail);

      const nextTrack: Track = normalizeTrack({
        id: detail.id,
        title: detail.title,
        artist: detail.artist,
        genre: detail.genre,
        coverURL: detail.coverURL || detail.coverUrl || "",
        coverUrl: detail.coverUrl || detail.coverURL || "",
        audioURL: detail.audioURL || detail.audioUrl || "",
        audioUrl: detail.audioUrl || detail.audioURL || "",
      });

      const nextQueue = detail.queue?.length
        ? detail.queue.map(normalizeTrack)
        : [nextTrack];

      const nextIndex =
        typeof detail.startIndex === "number" &&
        detail.startIndex >= 0 &&
        detail.startIndex < nextQueue.length
          ? detail.startIndex
          : 0;

      const selectedTrack = nextQueue[nextIndex] || nextTrack;
      playTrack(selectedTrack, nextQueue, nextIndex);
    }

    window.addEventListener("alos:play", onPlayEvent as EventListener);

    return () => {
      window.removeEventListener("alos:play", onPlayEvent as EventListener);
    };
  }, [playTrack]);

  useEffect(() => {
    if (typeof window === "undefined" || !track) return;

    let lastY = window.scrollY;
    let ticking = false;

    function handleScroll() {
      if (ticking) return;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastY;

        if (Math.abs(diff) > 8) {
          if (diff > 0 && !showQueue) {
            setShowPlayer(false);
          } else {
            setShowPlayer(true);
          }
          lastY = currentY;
        }

        if (currentY < 40) {
          setShowPlayer(true);
        }

        ticking = false;
      });

      ticking = true;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [track, showQueue]);

  useEffect(() => {
    if (typeof window === "undefined" || !showQueue) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowQueue(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showQueue]);

  if (pathname === "/auth" || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  if (!track) return null;

  const cover = track.coverURL || track.coverUrl || "";

  return (
    <>
      {showQueue && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          onClick={() => setShowQueue(false)}
        />
      )}

      <div
        className={`fixed bottom-4 left-1/2 z-[70] w-[95%] max-w-[980px] -translate-x-1/2 transition-all duration-300 md:bottom-5 ${
          showPlayer ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
      >
        {showQueue && (
          <div className="mb-3 overflow-hidden rounded-3xl border border-white/10 bg-black/85 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-5">
              <div>
                <div className="text-sm font-semibold text-white">Queue</div>
                <div className="text-xs text-white/50">Now playing + next up</div>
              </div>

              <button
                type="button"
                onClick={() => setShowQueue(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-3 md:p-4">
              <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300/70">
                Now Playing
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10">
                  {cover ? (
                    <img
                      src={cover}
                      alt={track.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/40">
                      ♪
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">
                    {track.title}
                  </div>
                  <div className="truncate text-xs text-white/60">
                    {track.artist}
                  </div>
                </div>

                <div className="flex items-end gap-0.5">
                  <span className="h-2 w-0.5 animate-[pulse_0.9s_ease-in-out_infinite] rounded-full bg-fuchsia-400" />
                  <span className="h-3 w-0.5 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-purple-400" />
                  <span className="h-2 w-0.5 animate-[pulse_0.8s_ease-in-out_infinite] rounded-full bg-pink-400" />
                </div>
              </div>

              <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-300/70">
                Next Up
              </div>

              {nextUp.length ? (
                <div className="space-y-2">
                  {nextUp.map((item, idx) => {
                    const itemCover = item.coverURL || item.coverUrl || "";

                    const targetIndex = queue.findIndex((q, qIndex) => {
                      const qAudio = q.audioURL || q.audioUrl || "";
                      const itemAudio = item.audioURL || item.audioUrl || "";
                      return (
                        qIndex !== currentIndex &&
                        q.id === item.id &&
                        qAudio === itemAudio
                      );
                    });

                    return (
                      <button
                        key={`${item.id}-${idx}`}
                        type="button"
                        onClick={() =>
                          playTrack(
                            item,
                            queue,
                            targetIndex >= 0 ? targetIndex : 0
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10">
                          {itemCover ? (
                            <img
                              src={itemCover}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-white/40">
                              ♪
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-white">
                            {item.title}
                          </div>
                          <div className="truncate text-xs text-white/55">
                            {item.artist}
                          </div>
                        </div>

                        <div className="text-xs text-white/40">Play</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
                  No more songs in queue.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/80 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="mx-auto flex items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-[280px]">
              <div className="relative h-14 w-14 shrink-0">
                {isPlaying && (
                  <>
                    <div className="absolute inset-0 rounded-2xl bg-fuchsia-500/30 blur-xl" />
                    <div className="absolute -inset-1 rounded-[18px] bg-purple-500/20 blur-lg" />
                  </>
                )}

                <div
                  className={`relative h-14 w-14 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 transition-all duration-300 ${
                    isPlaying
                      ? "shadow-[0_0_28px_rgba(217,70,239,0.35)]"
                      : "shadow-lg"
                  }`}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={track.title}
                      className={`h-full w-full object-cover transition-transform duration-500 ${
                        isPlaying ? "scale-105" : "scale-100"
                      }`}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/40">
                      ♪
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {track.title}
                </div>
                <div className="flex items-center gap-2">
                  <div className="truncate text-xs text-white/60">
                    {track.artist}
                  </div>

                  {isPlaying && (
                    <div className="hidden items-end gap-0.5 sm:flex">
                      <span className="h-2 w-0.5 animate-[pulse_0.9s_ease-in-out_infinite] rounded-full bg-fuchsia-400" />
                      <span className="h-3 w-0.5 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-purple-400" />
                      <span className="h-2 w-0.5 animate-[pulse_0.8s_ease-in-out_infinite] rounded-full bg-pink-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-[1.4] flex-col items-center gap-2">
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="text-base text-white/70 transition hover:text-white md:text-lg"
                  aria-label="Previous track"
                  title="Previous"
                >
                  ⏮
                </button>

                <button
                  type="button"
                  onClick={togglePlayPause}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg text-black transition ${
                    isPlaying
                      ? "bg-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.45)] hover:scale-105"
                      : "bg-white hover:scale-105"
                  }`}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="text-base text-white/70 transition hover:text-white md:text-lg"
                  aria-label="Next track"
                  title="Next"
                >
                  ⏭
                </button>

                <button
                  type="button"
                  onClick={() => setShowQueue((prev) => !prev)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    showQueue
                      ? "border-fuchsia-500/40 bg-fuchsia-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]"
                  }`}
                  aria-label="Queue"
                  title="Queue"
                >
                  Queue
                </button>
              </div>

              <div className="flex w-full max-w-[460px] items-center gap-2 md:gap-3">
                <span className="hidden w-10 text-right text-xs text-white/55 sm:block">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  disabled={!duration}
                  onChange={(e) => {
                    const audio = audioRef.current;
                    const value = Number(e.target.value);
                    if (!audio) return;
                    audio.currentTime = value;
                    setCurrentTime(value);
                  }}
                  className="w-full accent-white disabled:opacity-50"
                  aria-label="Seek"
                />

                <span className="hidden w-10 text-xs text-white/55 sm:block">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="hidden min-w-[180px] items-center justify-end gap-2 md:flex">
              <span className="text-sm text-white/60">🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 accent-white"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
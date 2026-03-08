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
import MobileNowPlaying from "@/components/Player/MobileNowPlaying";

function fmtTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

/** one global audio element */
let GLOBAL_AUDIO: HTMLAudioElement | null = null;

/** one global WebAudio chain */
let GLOBAL_CTX: AudioContext | null = null;
let GLOBAL_ANALYSER: AnalyserNode | null = null;
let GLOBAL_SRC: MediaElementAudioSourceNode | null = null;
let GLOBAL_ATTACHED_AUDIO: HTMLAudioElement | null = null;

/** avoid double counting plays */
const countedTrackIds = new Set<string>();

function getTrackAudioUrl(track: Partial<Track> | null | undefined) {
  if (!track) return "";
  const t = track as Track & {
    audioURL?: string;
    audioUrl?: string;
  };
  return t.audioUrl || t.audioURL || "";
}

function getTrackCoverUrl(track: Partial<Track> | null | undefined) {
  if (!track) return "";
  const t = track as Track & {
    coverURL?: string;
    coverUrl?: string;
  };
  return t.coverUrl || t.coverURL || "";
}

function normalizeTrack(track: Partial<Track> | null | undefined): Track | null {
  if (!track || !track.id) return null;

  return {
    id: String(track.id),
    title: track.title || "Untitled",
    artist: track.artist || "Unknown Artist",
    genre: track.genre || "",
    coverUrl: getTrackCoverUrl(track),
    audioUrl: getTrackAudioUrl(track),
  };
}

function ensureGlobalAudio() {
  if (typeof window === "undefined") return null;

  if (!GLOBAL_AUDIO) {
    GLOBAL_AUDIO = new Audio();
    GLOBAL_AUDIO.preload = "metadata";
    GLOBAL_AUDIO.crossOrigin = "anonymous";
  }

  return GLOBAL_AUDIO;
}

function ensureAnalyser(audio: HTMLAudioElement) {
  if (typeof window === "undefined") return;

  const AudioCtx =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtx) return;

  if (!GLOBAL_CTX) {
    GLOBAL_CTX = new AudioCtx();
  }

  if (!GLOBAL_ANALYSER) {
    GLOBAL_ANALYSER = GLOBAL_CTX.createAnalyser();
    GLOBAL_ANALYSER.fftSize = 64;
    GLOBAL_ANALYSER.smoothingTimeConstant = 0.85;
    GLOBAL_ANALYSER.connect(GLOBAL_CTX.destination);
  }

  if (!GLOBAL_SRC || GLOBAL_ATTACHED_AUDIO !== audio) {
    try {
      GLOBAL_SRC?.disconnect();
    } catch {}

    GLOBAL_SRC = GLOBAL_CTX.createMediaElementSource(audio);
    GLOBAL_SRC.connect(GLOBAL_ANALYSER);
    GLOBAL_ATTACHED_AUDIO = audio;
  }
}

export default function BottomPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countedPlayRef = useRef(false);

  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const progress = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return clamp01(currentTime / duration);
  }, [currentTime, duration]);

  useEffect(() => {
    const audio = ensureGlobalAudio();
    if (!audio) return;

    audioRef.current = audio;

    const restored = restorePlayerFromStorage();
    if (restored) {
      setTrack(restored.track);
      setIsPlaying(restored.isPlaying);
      setCurrentTime(restored.currentTime);
      setDuration(restored.duration);
      setVolume(restored.volume);
      setMuted(restored.muted);
      setQueue(restored.queue);
      setCurrentIndex(restored.currentIndex);

      audio.volume = restored.volume;
      audio.muted = restored.muted;

      const restoredSrc = getTrackAudioUrl(restored.track);
      if (restored.track && restoredSrc) {
        if (audio.src !== restoredSrc) {
          audio.src = restoredSrc;
        }

        if (restored.currentTime > 0) {
          audio.currentTime = restored.currentTime;
        }
      }
    } else {
      audio.volume = 0.85;
      audio.muted = false;
    }

    ensureAnalyser(audio);

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      updatePlayback({
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      updatePlayback({
        currentTime: audio.currentTime || 0,
      });

      if (
        audio.duration > 0 &&
        audio.currentTime / audio.duration >= 0.5 &&
        track?.id &&
        !countedPlayRef.current &&
        !countedTrackIds.has(track.id)
      ) {
        countedPlayRef.current = true;
        countedTrackIds.add(track.id);
        incrementSongPlays(track.id).catch((err) => {
          console.error("Failed to increment song plays", err);
        });
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      updatePlayback({ isPlaying: true });
    };

    const onPause = () => {
      setIsPlaying(false);
      updatePlayback({ isPlaying: false });
    };

    const onEnded = () => {
      const nextIndex =
        currentIndex >= 0 && currentIndex < queue.length - 1
          ? currentIndex + 1
          : -1;

      if (nextIndex >= 0) {
        const nextTrack = normalizeTrack(queue[nextIndex]);
        if (nextTrack) {
          countedPlayRef.current = false;
          setNowPlaying(nextTrack, queue, nextIndex);
        }
      } else {
        setIsPlaying(false);
        updatePlayback({ isPlaying: false });
      }
    };

    const onError = () => {
      const mediaError = audio.error;
      const errorInfo = {
        src: audio.currentSrc || audio.src || "",
        code: mediaError?.code ?? null,
        message:
          mediaError?.code === 1
            ? "MEDIA_ERR_ABORTED"
            : mediaError?.code === 2
            ? "MEDIA_ERR_NETWORK"
            : mediaError?.code === 3
            ? "MEDIA_ERR_DECODE"
            : mediaError?.code === 4
            ? "MEDIA_ERR_SRC_NOT_SUPPORTED"
            : "Unknown audio error",
        readyState: audio.readyState,
        networkState: audio.networkState,
        currentTime: audio.currentTime,
      };

      console.error("GLOBAL_AUDIO error", errorInfo);

      setIsPlaying(false);
      updatePlayback({ isPlaying: false });
    };

    const onCanPlay = () => {
      console.log("GLOBAL_AUDIO canplay", {
        src: audio.currentSrc || audio.src,
      });
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("canplay", onCanPlay);

    const unsub = subscribePlayer((state) => {
      const nextTrack = normalizeTrack(state.track);
      const nextQueue = (state.queue || [])
        .map((item) => normalizeTrack(item))
        .filter(Boolean) as Track[];

      setTrack(nextTrack);
      setQueue(nextQueue);
      setCurrentIndex(state.currentIndex);
      setVolume(state.volume);
      setMuted(state.muted);

      audio.volume = state.volume;
      audio.muted = state.muted;

      if (!nextTrack) {
        if (!audio.paused) {
          audio.pause();
        }
        audio.removeAttribute("src");
        audio.load();
        setCurrentTime(0);
        setDuration(0);
        countedPlayRef.current = false;
        return;
      }

      const src = getTrackAudioUrl(nextTrack);

      if (!src) {
        console.error("No audio URL found for track", nextTrack);
        if (!audio.paused) audio.pause();
        setIsPlaying(false);
        updatePlayback({ isPlaying: false });
        return;
      }

      if (audio.src !== src) {
        countedPlayRef.current = false;

        console.log("Loading track", {
          id: nextTrack.id,
          title: nextTrack.title,
          src,
        });

        audio.src = src;
        audio.load();

        if (state.currentTime > 0) {
          const seekAfterMeta = () => {
            try {
              audio.currentTime = state.currentTime;
            } catch {}
            audio.removeEventListener("loadedmetadata", seekAfterMeta);
          };
          audio.addEventListener("loadedmetadata", seekAfterMeta);
        } else {
          setCurrentTime(0);
        }
      }

      if (state.isPlaying) {
        const playNow = async () => {
          try {
            if (GLOBAL_CTX?.state === "suspended") {
              await GLOBAL_CTX.resume();
            }
            await audio.play();
          } catch (err) {
            console.error("Audio play failed", {
              err,
              src: audio.currentSrc || audio.src,
            });
            setIsPlaying(false);
            updatePlayback({ isPlaying: false });
          }
        };

        void playNow();
      } else {
        audio.pause();
      }
    });

    return () => {
      unsub();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [currentIndex, queue.length, track?.id]);

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration || duration <= 0) return;

    const nextTime = clamp01(value) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    updatePlayback({ currentTime: nextTime });
  };

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const src = getTrackAudioUrl(track);
    if (!src) {
      console.error("Cannot play: missing audio URL", track);
      return;
    }

    try {
      if (GLOBAL_CTX?.state === "suspended") {
        await GLOBAL_CTX.resume();
      }

      if (audio.paused) {
        if (audio.src !== src) {
          audio.src = src;
          audio.load();
        }
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error("Toggle play failed", {
        err,
        src: audio.currentSrc || audio.src,
      });
    }
  };

  const handlePrev = () => {
    if (!queue.length || currentIndex <= 0) return;
    const prevTrack = normalizeTrack(queue[currentIndex - 1]);
    if (!prevTrack) return;
    countedPlayRef.current = false;
    setNowPlaying(prevTrack, queue, currentIndex - 1);
  };

  const handleNext = () => {
    if (!queue.length || currentIndex >= queue.length - 1) return;
    const nextTrack = normalizeTrack(queue[currentIndex + 1]);
    if (!nextTrack) return;
    countedPlayRef.current = false;
    setNowPlaying(nextTrack, queue, currentIndex + 1);
  };

  const handleVolume = (value: number) => {
    const audio = audioRef.current;
    const nextVolume = clamp01(value);

    setVolume(nextVolume);
    if (audio) audio.volume = nextVolume;

    if (nextVolume > 0 && muted) {
      setMuted(false);
      if (audio) audio.muted = false;
      updatePlayback({ volume: nextVolume, muted: false });
      return;
    }

    updatePlayback({ volume: nextVolume });
  };

  const handleMute = () => {
    const audio = audioRef.current;
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (audio) audio.muted = nextMuted;
    updatePlayback({ muted: nextMuted });
  };

  if (!track) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-white/10 bg-black/85 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg bg-white/10">
              {getTrackCoverUrl(track) ? (
                <img
                  src={getTrackCoverUrl(track)}
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-white/50">
                  ♪
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {track.title}
              </div>
              <div className="truncate text-xs text-white/60">
                {track.artist}
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-xl flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="rounded-md border border-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
              >
                Prev
              </button>
              <button
                onClick={handleTogglePlay}
                className="rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={handleNext}
                className="rounded-md border border-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
              >
                Next
              </button>
            </div>

            <div className="flex w-full items-center gap-3">
              <span className="w-10 text-right text-xs text-white/60">
                {fmtTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={progress}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full"
              />
              <span className="w-10 text-xs text-white/60">
                {fmtTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex min-w-[150px] items-center justify-end gap-2">
            <button
              onClick={handleMute}
              className="rounded-md border border-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <MobileNowPlaying
        track={track}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={handleSeek}
        onVolume={handleVolume}
        onMute={handleMute}
      />
    </>
  );
}
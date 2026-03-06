"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Track = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl?: string;
};

type PlayerState = {
  current: Track | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  setVolume: (v: number) => void;
  playTrack: (t: Track) => void;
  toggle: () => void;
  seek: (t: number) => void;
  stop: () => void;
};

const PlayerCtx = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.9);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const a = audioRef.current;

    const onLoaded = () => setDuration(isFinite(a.duration) ? a.duration : 0);
    const onTime = () => setCurrentTime(a.currentTime || 0);
    const onEnd = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    a.volume = volume;

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  const setVolume = (v: number) => {
    const nv = Math.max(0, Math.min(1, v));
    setVolumeState(nv);
  };

  const playTrack = async (t: Track) => {
    const a = audioRef.current!;
    try {
      // If same track, just play
      if (current?.id === t.id) {
        await a.play();
        return;
      }

      setCurrent(t);
      setDuration(0);
      setCurrentTime(0);

      a.src = t.audioUrl;
      a.currentTime = 0;
      await a.play();
    } catch {
      // Browser might block autoplay until user interaction. Clicking play button counts as interaction.
      setIsPlaying(false);
    }
  };

  const toggle = async () => {
    const a = audioRef.current;
    if (!a || !current) return;

    try {
      if (a.paused) await a.play();
      else a.pause();
    } catch {
      setIsPlaying(false);
    }
  };

  const seek = (t: number) => {
    const a = audioRef.current;
    if (!a || !current) return;
    a.currentTime = Math.max(0, Math.min(duration || 0, t));
    setCurrentTime(a.currentTime);
  };

  const stop = () => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setCurrent(null);
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
  };

  const value = useMemo<PlayerState>(
    () => ({
      current,
      isPlaying,
      duration,
      currentTime,
      volume,
      setVolume,
      playTrack,
      toggle,
      seek,
      stop,
    }),
    [current, isPlaying, duration, currentTime, volume]
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}
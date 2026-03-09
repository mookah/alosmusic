// lib/playerStore.ts
"use client";

export type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverUrl?: string;
  audioUrl?: string;
  coverURL?: string;
  audioURL?: string;
};

export type RepeatMode = "off" | "one" | "all";

type PlayerSnapshot = {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  queue: Track[];
  currentIndex: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
};

const STORAGE_KEY = "alosmusic_player";

const DEFAULT_STATE: PlayerSnapshot = {
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  muted: false,
  queue: [],
  currentIndex: -1,
  repeatMode: "off",
  shuffle: false,
};

let state: PlayerSnapshot = { ...DEFAULT_STATE };

const listeners = new Set<(state: PlayerSnapshot) => void>();

function cloneState(): PlayerSnapshot {
  return {
    ...state,
    track: state.track ? { ...state.track } : null,
    queue: state.queue.map((track) => ({ ...track })),
  };
}

function persistPlayerToStorage() {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist player state:", error);
  }
}

function emit() {
  persistPlayerToStorage();
  const snapshot = cloneState();
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribePlayer(listener: (state: PlayerSnapshot) => void) {
  listeners.add(listener);
  listener(cloneState());

  return () => {
    listeners.delete(listener);
  };
}

export function getPlayerState(): PlayerSnapshot {
  return cloneState();
}

export function restorePlayerFromStorage(): PlayerSnapshot {
  if (typeof window === "undefined") return cloneState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneState();

    const parsed = JSON.parse(raw) as Partial<PlayerSnapshot>;

    state = {
      ...DEFAULT_STATE,
      ...parsed,
      track: parsed.track ?? null,
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      currentIndex:
        typeof parsed.currentIndex === "number" ? parsed.currentIndex : -1,
      repeatMode:
        parsed.repeatMode === "one" ||
        parsed.repeatMode === "all" ||
        parsed.repeatMode === "off"
          ? parsed.repeatMode
          : "off",
      volume:
        typeof parsed.volume === "number"
          ? Math.max(0, Math.min(1, parsed.volume))
          : DEFAULT_STATE.volume,
      muted: Boolean(parsed.muted),
      isPlaying: Boolean(parsed.isPlaying),
      currentTime:
        typeof parsed.currentTime === "number" ? parsed.currentTime : 0,
      duration: typeof parsed.duration === "number" ? parsed.duration : 0,
      shuffle: Boolean(parsed.shuffle),
    };

    return cloneState();
  } catch (error) {
    console.error("Failed to restore player state:", error);
    state = { ...DEFAULT_STATE };
    return cloneState();
  }
}

export function setQueue(queue: Track[], startIndex = 0) {
  const safeQueue = Array.isArray(queue) ? queue.filter(Boolean) : [];

  if (safeQueue.length === 0) {
    state = {
      ...state,
      queue: [],
      currentIndex: -1,
      track: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    };
    emit();
    return;
  }

  const safeIndex = Math.max(0, Math.min(startIndex, safeQueue.length - 1));

  state = {
    ...state,
    queue: safeQueue,
    currentIndex: safeIndex,
    track: safeQueue[safeIndex],
    currentTime: 0,
    duration: 0,
  };

  emit();
}

export function setNowPlaying(
  track: Track | null,
  queue?: Track[],
  startIndex?: number
) {
  if (!track) {
    state = {
      ...state,
      track: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentIndex: -1,
    };
    emit();
    return;
  }

  const sameTrack = state.track?.id === track.id;

  let nextQueue = state.queue;
  let nextIndex = state.currentIndex;

  if (Array.isArray(queue) && queue.length > 0) {
    nextQueue = queue.filter(Boolean);

    if (typeof startIndex === "number") {
      nextIndex = Math.max(0, Math.min(startIndex, nextQueue.length - 1));
    } else {
      const foundIndex = nextQueue.findIndex((item) => item.id === track.id);
      nextIndex = foundIndex >= 0 ? foundIndex : 0;
    }
  } else if (state.queue.length === 0) {
    nextQueue = [track];
    nextIndex = 0;
  } else {
    const existingIndex = state.queue.findIndex((item) => item.id === track.id);
    if (existingIndex >= 0) {
      nextIndex = existingIndex;
    } else {
      nextQueue = [...state.queue, track];
      nextIndex = nextQueue.length - 1;
    }
  }

  state = {
    ...state,
    queue: nextQueue,
    currentIndex: nextIndex,
    track,
    isPlaying: true,
    currentTime: sameTrack ? state.currentTime : 0,
    duration: sameTrack ? state.duration : 0,
  };

  emit();
}

export function playPlayer() {
  if (!state.track && state.queue.length > 0 && state.currentIndex >= 0) {
    state = {
      ...state,
      track: state.queue[state.currentIndex],
      isPlaying: true,
    };
  } else if (state.track) {
    state = {
      ...state,
      isPlaying: true,
    };
  }

  emit();
}

export function pausePlayer() {
  state = {
    ...state,
    isPlaying: false,
  };
  emit();
}

export function stopPlayer() {
  state = {
    ...state,
    isPlaying: false,
    currentTime: 0,
  };
  emit();
}

export function seekPlayer(time: number) {
  state = {
    ...state,
    currentTime: Math.max(0, time),
  };
  emit();
}

export function updatePlayback(
  values: Partial<Pick<PlayerSnapshot, "currentTime" | "duration" | "isPlaying">>
) {
  state = {
    ...state,
    ...values,
  };
  emit();
}

export function setVolume(volume: number) {
  const safeVolume = Math.max(0, Math.min(1, volume));

  state = {
    ...state,
    volume: safeVolume,
    muted: safeVolume <= 0 ? true : state.muted,
  };
  emit();
}

export function setMuted(muted: boolean) {
  state = {
    ...state,
    muted,
  };
  emit();
}

export function setRepeatMode(repeatMode: RepeatMode) {
  state = {
    ...state,
    repeatMode,
  };
  emit();
}

export function setShuffle(shuffle: boolean) {
  state = {
    ...state,
    shuffle,
  };
  emit();
}

export function playNextTrack() {
  if (state.queue.length === 0) return;

  if (state.repeatMode === "one" && state.track) {
    state = {
      ...state,
      currentTime: 0,
      isPlaying: true,
    };
    emit();
    return;
  }

  let nextIndex = state.currentIndex;

  if (state.shuffle && state.queue.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } while (nextIndex === state.currentIndex);
  } else {
    nextIndex += 1;
  }

  if (nextIndex >= state.queue.length) {
    if (state.repeatMode === "all") {
      nextIndex = 0;
    } else {
      state = {
        ...state,
        isPlaying: false,
        currentTime: 0,
      };
      emit();
      return;
    }
  }

  state = {
    ...state,
    currentIndex: nextIndex,
    track: state.queue[nextIndex],
    isPlaying: true,
    currentTime: 0,
    duration: 0,
  };
  emit();
}

export function playPreviousTrack() {
  if (state.queue.length === 0) return;

  let prevIndex = state.currentIndex;

  if (state.shuffle && state.queue.length > 1) {
    do {
      prevIndex = Math.floor(Math.random() * state.queue.length);
    } while (prevIndex === state.currentIndex);
  } else {
    prevIndex -= 1;
  }

  if (prevIndex < 0) {
    prevIndex = state.repeatMode === "all" ? state.queue.length - 1 : 0;
  }

  state = {
    ...state,
    currentIndex: prevIndex,
    track: state.queue[prevIndex],
    isPlaying: true,
    currentTime: 0,
    duration: 0,
  };
  emit();
}

export function clearPlayer() {
  state = { ...DEFAULT_STATE };
  emit();
}
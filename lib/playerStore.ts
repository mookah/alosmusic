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

const STORAGE_KEY = "alosmusic_player";
const listeners = new Set<(state: PlayerSnapshot) => void>();

function cloneState(): PlayerSnapshot {
  return {
    ...state,
    queue: [...state.queue],
  };
}

function emit() {
  persistPlayerToStorage();
  const snapshot = cloneState();
  listeners.forEach((listener) => listener(snapshot));
}

function persistPlayerToStorage() {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist player state:", error);
  }
}

function clampIndex(index: number, length: number) {
  if (!length) return -1;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

function findTrackIndex(track: Track | null, queue: Track[]) {
  if (!track) return -1;
  return queue.findIndex((t) => t.id === track.id);
}

function getNextShuffledIndex(length: number, currentIndex: number) {
  if (length <= 1) return currentIndex;

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }
  return nextIndex;
}

export function restorePlayerFromStorage(): PlayerSnapshot {
  if (typeof window === "undefined") return cloneState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state = { ...DEFAULT_STATE };
      return cloneState();
    }

    const parsed = JSON.parse(raw) as Partial<PlayerSnapshot>;

    const restoredQueue = Array.isArray(parsed.queue) ? parsed.queue : [];
    const restoredTrack = parsed.track ?? null;

    let restoredIndex =
      typeof parsed.currentIndex === "number" ? parsed.currentIndex : -1;

    if (restoredTrack && restoredQueue.length > 0) {
      const matched = findTrackIndex(restoredTrack, restoredQueue);
      if (matched >= 0) restoredIndex = matched;
    }

    if (restoredTrack && restoredQueue.length === 0) {
      restoredIndex = 0;
    }

    const finalQueue =
      restoredQueue.length > 0
        ? restoredQueue
        : restoredTrack
        ? [restoredTrack]
        : [];

    state = {
      track: restoredTrack,
      isPlaying: !!parsed.isPlaying,
      currentTime: Number(parsed.currentTime || 0),
      duration: Number(parsed.duration || 0),
      volume: typeof parsed.volume === "number" ? parsed.volume : 0.85,
      muted: !!parsed.muted,
      queue: finalQueue,
      currentIndex: clampIndex(restoredIndex, finalQueue.length),
      repeatMode:
        parsed.repeatMode === "one" ||
        parsed.repeatMode === "all" ||
        parsed.repeatMode === "off"
          ? parsed.repeatMode
          : "off",
      shuffle: !!parsed.shuffle,
    };

    if (state.currentIndex >= 0 && state.queue[state.currentIndex]) {
      state.track = state.queue[state.currentIndex];
    } else if (!state.track) {
      state.currentIndex = -1;
    }

    return cloneState();
  } catch (error) {
    console.error("Failed to restore player state:", error);
    state = { ...DEFAULT_STATE };
    return cloneState();
  }
}

export function subscribePlayer(listener: (state: PlayerSnapshot) => void) {
  listeners.add(listener);
  listener(cloneState());
  return () => listeners.delete(listener);
}

export function setQueue(tracks: Track[], startIndex = 0) {
  if (!tracks.length) {
    state.queue = [];
    state.currentIndex = -1;
    state.track = null;
    state.isPlaying = false;
    state.currentTime = 0;
    state.duration = 0;
    emit();
    return;
  }

  const safeIndex = clampIndex(startIndex, tracks.length);

  state.queue = [...tracks];
  state.currentIndex = safeIndex;
  state.track = state.queue[safeIndex];
  state.isPlaying = true;
  state.currentTime = 0;
  state.duration = 0;

  emit();
}

export function setNowPlaying(track: Track | null, queue?: Track[], startIndex?: number) {
  if (!track) {
    state.track = null;
    state.isPlaying = false;
    state.currentTime = 0;
    state.duration = 0;
    state.queue = [];
    state.currentIndex = -1;
    emit();
    return;
  }

  if (Array.isArray(queue) && queue.length > 0) {
    const matchedIndex =
      typeof startIndex === "number" && queue[startIndex]?.id === track.id
        ? startIndex
        : findTrackIndex(track, queue);

    state.queue = [...queue];
    state.currentIndex = matchedIndex >= 0 ? matchedIndex : 0;
    state.track = state.queue[state.currentIndex] ?? track;
  } else {
    const existingIndex = findTrackIndex(track, state.queue);

    if (existingIndex >= 0) {
      state.currentIndex = existingIndex;
      state.track = state.queue[existingIndex];
    } else {
      state.queue = [track];
      state.currentIndex = 0;
      state.track = track;
    }
  }

  state.isPlaying = true;
  state.currentTime = 0;
  state.duration = 0;

  emit();
}

export function updatePlayback(
  patch:
    | boolean
    | Partial<
        Pick<
          PlayerSnapshot,
          | "track"
          | "isPlaying"
          | "currentTime"
          | "duration"
          | "volume"
          | "muted"
          | "repeatMode"
          | "shuffle"
        >
      >
) {
  if (typeof patch === "boolean") {
    state.isPlaying = patch;
  } else {
    state = {
      ...state,
      ...patch,
    };

    if (patch.track !== undefined) {
      if (patch.track === null) {
        state.currentIndex = -1;
      } else {
        const matchedIndex = findTrackIndex(patch.track, state.queue);
        if (matchedIndex >= 0) {
          state.currentIndex = matchedIndex;
        }
      }
    }
  }

  emit();
}

export function playNext() {
  if (!state.queue.length) return;

  if (state.repeatMode === "one") {
    state.currentTime = 0;
    state.duration = 0;
    state.isPlaying = true;
    emit();
    return;
  }

  let nextIndex = -1;

  if (state.shuffle) {
    nextIndex = getNextShuffledIndex(state.queue.length, state.currentIndex);
  } else {
    nextIndex = state.currentIndex + 1;
  }

  if (nextIndex >= 0 && nextIndex < state.queue.length) {
    state.currentIndex = nextIndex;
    state.track = state.queue[nextIndex];
    state.isPlaying = true;
    state.currentTime = 0;
    state.duration = 0;
    emit();
    return;
  }

  if (state.repeatMode === "all" && state.queue.length > 0) {
    state.currentIndex = 0;
    state.track = state.queue[0];
    state.isPlaying = true;
    state.currentTime = 0;
    state.duration = 0;
    emit();
    return;
  }

  state.isPlaying = false;
  state.currentTime = 0;
  emit();
}

export function playPrev() {
  if (!state.queue.length) return;

  if (state.currentTime > 3) {
    state.currentTime = 0;
    emit();
    return;
  }

  let prevIndex = -1;

  if (state.shuffle) {
    prevIndex = getNextShuffledIndex(state.queue.length, state.currentIndex);
  } else {
    prevIndex = state.currentIndex - 1;
  }

  if (prevIndex >= 0 && prevIndex < state.queue.length) {
    state.currentIndex = prevIndex;
    state.track = state.queue[prevIndex];
    state.isPlaying = true;
    state.currentTime = 0;
    state.duration = 0;
    emit();
    return;
  }

  if (state.repeatMode === "all" && state.queue.length > 0) {
    const lastIndex = state.queue.length - 1;
    state.currentIndex = lastIndex;
    state.track = state.queue[lastIndex];
    state.isPlaying = true;
    state.currentTime = 0;
    state.duration = 0;
    emit();
  }
}

export function toggleShuffle() {
  state.shuffle = !state.shuffle;
  emit();
}

export function setShuffle(value: boolean) {
  state.shuffle = value;
  emit();
}

export function cycleRepeatMode() {
  if (state.repeatMode === "off") {
    state.repeatMode = "all";
  } else if (state.repeatMode === "all") {
    state.repeatMode = "one";
  } else {
    state.repeatMode = "off";
  }

  emit();
}

export function setRepeatMode(mode: RepeatMode) {
  state.repeatMode = mode;
  emit();
}

export function getPlayerState() {
  return cloneState();
}
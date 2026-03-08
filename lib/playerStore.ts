export type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverUrl?: string;
  audioUrl?: string;

  // backward compatibility with older Firestore fields
  coverURL?: string;
  audioURL?: string;
};

export type RepeatMode = "off" | "one" | "all";

export type PlayerSnapshot = {
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

function normalizeTrack(track: Track | null | undefined): Track | null {
  if (!track || !track.id) return null;

  return {
    id: String(track.id),
    title: track.title || "Untitled",
    artist: track.artist || "Unknown Artist",
    genre: track.genre || "",
    coverUrl: track.coverUrl || track.coverURL || "",
    audioUrl: track.audioUrl || track.audioURL || "",
    coverURL: track.coverURL || track.coverUrl || "",
    audioURL: track.audioURL || track.audioUrl || "",
  };
}

function normalizeQueue(queue: Track[] | null | undefined): Track[] {
  if (!Array.isArray(queue)) return [];
  return queue.map((track) => normalizeTrack(track)).filter(Boolean) as Track[];
}

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

function clampIndex(index: number, length: number) {
  if (!length) return -1;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}

function findTrackIndex(track: Track | null, queue: Track[]) {
  if (!track) return -1;
  return queue.findIndex((item) => item.id === track.id);
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
  if (typeof window === "undefined") {
    return cloneState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      state = { ...DEFAULT_STATE };
      return cloneState();
    }

    const parsed = JSON.parse(raw) as Partial<PlayerSnapshot>;

    const restoredTrack = normalizeTrack(parsed.track ?? null);
    const restoredQueue = normalizeQueue(parsed.queue);
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
      currentTime:
        typeof parsed.currentTime === "number" ? parsed.currentTime : 0,
      duration: typeof parsed.duration === "number" ? parsed.duration : 0,
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
  const normalizedTracks = normalizeQueue(tracks);

  if (!normalizedTracks.length) {
    state.queue = [];
    state.currentIndex = -1;
    state.track = null;
    state.isPlaying = false;
    state.currentTime = 0;
    state.duration = 0;
    emit();
    return;
  }

  const safeIndex = clampIndex(startIndex, normalizedTracks.length);

  state.queue = normalizedTracks;
  state.currentIndex = safeIndex;
  state.track = normalizedTracks[safeIndex];
  state.isPlaying = true;
  state.currentTime = 0;
  state.duration = 0;

  emit();
}

export function setNowPlaying(
  track: Track | null,
  queue?: Track[],
  startIndex?: number
) {
  const normalizedTrack = normalizeTrack(track);

  if (!normalizedTrack) {
    state.track = null;
    state.isPlaying = false;
    state.currentTime = 0;
    state.duration = 0;
    state.queue = [];
    state.currentIndex = -1;
    emit();
    return;
  }

  const normalizedQueue = normalizeQueue(queue);

  if (normalizedQueue.length > 0) {
    const matchedIndex =
      typeof startIndex === "number" &&
      normalizedQueue[startIndex]?.id === normalizedTrack.id
        ? startIndex
        : findTrackIndex(normalizedTrack, normalizedQueue);

    state.queue = normalizedQueue;
    state.currentIndex = matchedIndex >= 0 ? matchedIndex : 0;
    state.track = state.queue[state.currentIndex] ?? normalizedTrack;
  } else {
    const existingIndex = findTrackIndex(normalizedTrack, state.queue);

    if (existingIndex >= 0) {
      state.currentIndex = existingIndex;
      state.track = state.queue[existingIndex];
    } else {
      state.queue = [normalizedTrack];
      state.currentIndex = 0;
      state.track = normalizedTrack;
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
    const nextTrack =
      patch.track !== undefined ? normalizeTrack(patch.track) : state.track;

    state = {
      ...state,
      ...patch,
      track: nextTrack,
    };

    if (patch.track !== undefined) {
      if (nextTrack === null) {
        state.currentIndex = -1;
      } else {
        const matchedIndex = findTrackIndex(nextTrack, state.queue);
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
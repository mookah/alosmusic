export type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverUrl?: string;
  audioUrl?: string;
};

type PlayerSnapshot = {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  queue: Track[];
  currentIndex: number;
};

let state: PlayerSnapshot = {
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  muted: false,
  queue: [],
  currentIndex: -1,
};

const STORAGE_KEY = "alosmusic_player";
const listeners = new Set<(state: PlayerSnapshot) => void>();

function emit() {
  persistPlayerToStorage();
  listeners.forEach((listener) => listener({ ...state }));
}

function persistPlayerToStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function restorePlayerFromStorage(): PlayerSnapshot {
  if (typeof window === "undefined") return { ...state };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...state };

    const parsed = JSON.parse(raw) as Partial<PlayerSnapshot>;

    state = {
      track: parsed.track ?? null,
      isPlaying: !!parsed.isPlaying,
      currentTime: Number(parsed.currentTime || 0),
      duration: Number(parsed.duration || 0),
      volume: typeof parsed.volume === "number" ? parsed.volume : 0.85,
      muted: !!parsed.muted,
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
      currentIndex:
        typeof parsed.currentIndex === "number" ? parsed.currentIndex : -1,
    };

    return { ...state };
  } catch {
    return { ...state };
  }
}

export function subscribePlayer(listener: (state: PlayerSnapshot) => void) {
  listeners.add(listener);
  listener({ ...state });
  return () => listeners.delete(listener);
}

export function setQueue(tracks: Track[], startIndex = 0) {
  state.queue = tracks;
  state.currentIndex = startIndex;

  if (tracks[startIndex]) {
    state.track = tracks[startIndex];
    state.isPlaying = true;
    state.currentTime = 0;
    state.duration = 0;
  }

  emit();
}

export function setNowPlaying(track: Track | null) {
  state.track = track;

  if (track) {
    const existingIndex = state.queue.findIndex((t) => t.id === track.id);

    if (existingIndex >= 0) {
      state.currentIndex = existingIndex;
    } else {
      state.queue = [track];
      state.currentIndex = 0;
    }

    state.isPlaying = true;
  } else {
    state.isPlaying = false;
    state.currentTime = 0;
    state.duration = 0;
    state.queue = [];
    state.currentIndex = -1;
  }

  emit();
}

export function updatePlayback(
  patch:
    | boolean
    | Partial<
        Pick<
          PlayerSnapshot,
          "track" | "isPlaying" | "currentTime" | "duration" | "volume" | "muted"
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
  }

  emit();
}

export function playNext() {
  if (!state.queue.length) return;

  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= 0 && nextIndex < state.queue.length) {
    state.currentIndex = nextIndex;
    state.track = state.queue[nextIndex];
    state.isPlaying = true;
    state.currentTime = 0;
    state.duration = 0;
    emit();
  }
}

export function playPrev() {
  if (!state.queue.length) return;

  const prevIndex = state.currentIndex - 1;
  if (prevIndex >= 0 && prevIndex < state.queue.length) {
    state.currentIndex = prevIndex;
    state.track = state.queue[prevIndex];
    state.isPlaying = true;
    state.currentTime = 0;
    state.duration = 0;
    emit();
  }
}

export function getPlayerState() {
  return { ...state };
}
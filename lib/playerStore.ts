export type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  audioUrl: string;
  coverUrl?: string;
};

export type PlayerState = {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
};

const KEY = "alos_player_state_v1";

let state: PlayerState = {
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  muted: false,
};

const listeners = new Set<(s: PlayerState) => void>();

function emit() {
  for (const fn of listeners) fn(state);
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export function subscribePlayer(fn: (s: PlayerState) => void) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function setNowPlaying(track: Track | null) {
  state = { ...state, track };
  if (!track) {
    state = { ...state, isPlaying: false, currentTime: 0, duration: 0 };
  }
  persist();
  emit();
}

export function updatePlayback(partial: Partial<PlayerState>) {
  state = { ...state, ...partial };
  persist();
  emit();
}

export function getPlayerState() {
  return state;
}

/** ✅ Restore FULL state */
export function restorePlayerFromStorage(): PlayerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return state;

    const parsed = JSON.parse(raw) as Partial<PlayerState>;

    state = {
      ...state,
      ...parsed,
      track: parsed.track?.audioUrl ? (parsed.track as Track) : null,
      isPlaying: !!parsed.isPlaying,
      currentTime: Number(parsed.currentTime || 0),
      duration: Number(parsed.duration || 0),
      volume: typeof parsed.volume === "number" ? parsed.volume : 0.85,
      muted: !!parsed.muted,
    };

    emit();
  } catch {}
  return state;
}

/** ✅ Compatibility: your BottomPlayer imports this name */
export function restoreNowPlayingFromStorage(): Track | null {
  const s = restorePlayerFromStorage();
  return s.track;
}
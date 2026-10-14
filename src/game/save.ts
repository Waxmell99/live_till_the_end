import { SAVE_KEY } from './constants';
import type { GameState } from './types';
import { isFrontlineEvent, validFrontlineMission } from './frontline';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function serializeGame(state: GameState): string {
  return JSON.stringify(state);
}

export function parseGame(raw: string): GameState | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Partial<GameState>;
    if (
      candidate.version !== 1 ||
      typeof candidate.seed !== 'number' ||
      typeof candidate.rngState !== 'number' ||
      typeof candidate.currentDate !== 'string' ||
      !candidate.character ||
      !candidate.stats ||
      !Array.isArray(candidate.npcs) ||
      !Array.isArray(candidate.journal)
    ) {
      return null;
    }
    if (candidate.frontline !== undefined && !validFrontlineMission(candidate.frontline)) return null;
    if (candidate.frontline?.status === 'active' && candidate.currentEventId !== `frontline-${candidate.frontline.stage}`) return null;
    if (typeof candidate.currentEventId === 'string' && isFrontlineEvent(candidate.currentEventId) && candidate.frontline?.status !== 'active') return null;
    return {
      ...candidate,
      eventMemory: candidate.eventMemory && typeof candidate.eventMemory === 'object' ? candidate.eventMemory : {},
      storyArcs: candidate.storyArcs && typeof candidate.storyArcs === 'object' ? candidate.storyArcs : {
        james: 0,
        arthur: 0,
        edward: 0,
        george: 0,
        alfie: 0,
      },
      scheduledEvents: Array.isArray(candidate.scheduledEvents) ? candidate.scheduledEvents : [],
    } as GameState;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState, storage: StorageLike = window.localStorage): void {
  try {
    storage.setItem(SAVE_KEY, serializeGame(state));
  } catch {
    // Storage may be disabled by the browser. The active session still remains playable.
  }
}

export function loadGame(storage: StorageLike = window.localStorage): GameState | null {
  try {
    const raw = storage.getItem(SAVE_KEY);
    return raw ? parseGame(raw) : null;
  } catch {
    return null;
  }
}

export function clearSave(storage: StorageLike = window.localStorage): void {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}

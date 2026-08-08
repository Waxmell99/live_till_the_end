import { SAVE_KEY } from './constants';
import type { GameState } from './types';

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
    return candidate as GameState;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState, storage: StorageLike = window.localStorage): void {
  storage.setItem(SAVE_KEY, serializeGame(state));
}

export function loadGame(storage: StorageLike = window.localStorage): GameState | null {
  const raw = storage.getItem(SAVE_KEY);
  return raw ? parseGame(raw) : null;
}

export function clearSave(storage: StorageLike = window.localStorage): void {
  storage.removeItem(SAVE_KEY);
}

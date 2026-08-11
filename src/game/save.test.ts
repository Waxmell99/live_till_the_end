import { describe, expect, it } from 'vitest';
import { createNewGame } from './engine';
import { loadGame, parseGame, saveGame, serializeGame, type StorageLike } from './save';

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const profile = {
  name: 'Ada Turner',
  age: 24,
  occupation: 'Clerk',
  hometown: 'Leeds',
  family: 'A mother and brother',
  enlisted: 'January 1916',
};

describe('save system', () => {
  it('round-trips the entire deterministic state', () => {
    const game = createNewGame(profile, 123456);
    expect(parseGame(serializeGame(game))).toEqual(game);
  });

  it('saves and loads through a storage adapter', () => {
    const storage = new MemoryStorage();
    const game = createNewGame(profile, 777);
    saveGame(game, storage);
    expect(loadGame(storage)).toEqual(game);
  });

  it('rejects corrupt and incompatible saves', () => {
    expect(parseGame('not json')).toBeNull();
    expect(parseGame('{"version":99}')).toBeNull();
    expect(parseGame('null')).toBeNull();
  });

  it('adds narrative state defaults to an older version-one save', () => {
    const game = createNewGame(profile, 90210);
    const legacy = structuredClone(game) as Partial<typeof game>;
    delete legacy.eventMemory;
    delete legacy.storyArcs;
    delete legacy.scheduledEvents;
    const loaded = parseGame(JSON.stringify(legacy));
    expect(loaded?.eventMemory).toEqual({});
    expect(loaded?.storyArcs).toEqual({ james: 0, arthur: 0, edward: 0, george: 0, alfie: 0 });
    expect(loaded?.scheduledEvents).toEqual([]);
  });
});

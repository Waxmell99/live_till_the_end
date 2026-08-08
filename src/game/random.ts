/** A small, deterministic PRNG whose full state fits in a save file. */
export function nextRandom(state: number): [number, number] {
  const nextState = (state + 0x6d2b79f5) >>> 0;
  let value = nextState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return [((value ^ (value >>> 14)) >>> 0) / 4294967296, nextState];
}

export class RandomCursor {
  state: number;

  constructor(state: number) {
    this.state = state >>> 0;
  }

  next(): number {
    const [value, state] = nextRandom(this.state);
    this.state = state;
    return value;
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('Cannot pick from an empty collection');
    return items[this.int(0, items.length - 1)];
  }

  weighted<T>(items: readonly T[], weight: (item: T) => number): T {
    if (items.length === 0) throw new Error('Cannot pick from an empty collection');
    const total = items.reduce((sum, item) => sum + Math.max(0, weight(item)), 0);
    if (total <= 0) return this.pick(items);
    let roll = this.next() * total;
    for (const item of items) {
      roll -= Math.max(0, weight(item));
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }
}

export function normalizeSeed(seed: number): number {
  const normalized = Math.abs(Math.trunc(seed)) >>> 0;
  return normalized || 19171111;
}

export function seedFromText(text: string): number {
  let hash = 2166136261;
  for (const character of text) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return normalizeSeed(hash);
}

import { describe, expect, it } from 'vitest';
import { nextRandom, RandomCursor, seedFromText } from './random';

describe('seeded random system', () => {
  it('reproduces the same sequence from the same state', () => {
    const first = new RandomCursor(19171111);
    const second = new RandomCursor(19171111);
    expect(Array.from({ length: 20 }, () => first.next())).toEqual(Array.from({ length: 20 }, () => second.next()));
    expect(first.state).toBe(second.state);
  });

  it('serializes all state in a single integer', () => {
    const [value, state] = nextRandom(42);
    const [restoredValue] = nextRandom(42);
    expect(value).toBe(restoredValue);
    expect(state).toBeTypeOf('number');
  });

  it('creates stable, non-zero text seeds', () => {
    expect(seedFromText('Thomas Miller')).toBe(seedFromText('Thomas Miller'));
    expect(seedFromText('Thomas Miller')).not.toBe(seedFromText('Arthur Hale'));
    expect(seedFromText('')).not.toBe(0);
  });
});

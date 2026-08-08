import { describe, expect, it } from 'vitest';
import { simulateGame, simulateMany } from './simulation';

describe('automatic simulation', () => {
  it('finishes a complete game without exceeding the safety turn limit', () => {
    const state = simulateGame(19171111);
    expect(state.status).toBe('ended');
    expect(state.turn).toBeLessThan(260);
  });

  it('finds both survival and death across a representative seed sample', () => {
    const summary = simulateMany(120, 19171111);
    expect(summary.stalled).toBe(0);
    expect(summary.survived).toBeGreaterThan(0);
    expect(summary.killed + summary.wounds).toBeGreaterThan(0);
    expect(summary.invalided + summary.pow).toBeGreaterThan(0);
    expect(summary.averageTurns).toBeGreaterThan(20);
  });
});

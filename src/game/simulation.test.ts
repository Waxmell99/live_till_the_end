import { describe, expect, it } from 'vitest';
import { narrativeMetrics, simulateGame, simulateMany } from './simulation';

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

  it('keeps long surviving lives varied and completes personal arcs', () => {
    let survivor;
    for (let seed = 1; seed < 300 && !survivor; seed += 1) {
      const state = simulateGame(seed, 260, 'careful');
      if (state.ending?.type === 'survived') survivor = state;
    }
    expect(survivor).toBeDefined();
    const narrative = narrativeMetrics(survivor!);
    expect(narrative.repeatRate).toBeLessThan(0.16);
    expect(narrative.completedStoryArcs).toBeGreaterThanOrEqual(3);
    expect(narrative.chapterEvents).toBe(6);
  });
});

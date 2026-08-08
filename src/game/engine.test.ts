import { describe, expect, it } from 'vitest';
import { COMBAT_EVENTS } from '../data/events/combat';
import { HISTORICAL_EVENTS, LETTER_EVENTS } from '../data/events';
import { RELATIONSHIP_EVENTS } from '../data/events/relationships';
import { ROUTINE_EVENTS } from '../data/events/routine';
import { HISTORY_TIMELINE } from '../data/history';
import { LETTERS } from '../data/letters';
import { ARMISTICE_DATE, START_DATE } from './constants';
import {
  advanceGameTime,
  applyStatEffects,
  availableChoices,
  createNewGame,
  getCurrentEvent,
  requirementsMet,
  resolveChoice,
  triggerHistory,
} from './engine';
import { RandomCursor } from './random';
import type { CharacterInput, GameState } from './types';

const PROFILE: CharacterInput = {
  name: 'Thomas Miller',
  age: 19,
  occupation: 'Railway apprentice',
  hometown: 'Manchester',
  family: 'Parents and a younger sister at home',
  enlisted: 'September 1916',
};

describe('content requirements', () => {
  it('ships the requested first-version content scale', () => {
    expect(ROUTINE_EVENTS.length).toBeGreaterThanOrEqual(50);
    expect(COMBAT_EVENTS.length).toBeGreaterThanOrEqual(15);
    expect(RELATIONSHIP_EVENTS.length).toBeGreaterThanOrEqual(10);
    expect(HISTORY_TIMELINE.length).toBeGreaterThanOrEqual(10);
    expect(HISTORICAL_EVENTS.length).toBeGreaterThanOrEqual(10);
    expect(LETTERS.length).toBeGreaterThanOrEqual(10);
    expect(LETTER_EVENTS.length).toBe(LETTERS.length);
  });

  it('gives ordinary and combat events at least two decisions', () => {
    for (const event of [...ROUTINE_EVENTS, ...COMBAT_EVENTS, ...RELATIONSHIP_EVENTS]) {
      expect(event.choices.length, event.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('time and attributes', () => {
  it('advances days and hours deterministically', () => {
    const first = new RandomCursor(101);
    const second = new RandomCursor(101);
    const days = advanceGameTime(START_DATE, { min: 5, max: 8, unit: 'days' }, first);
    expect(days).toBe(advanceGameTime(START_DATE, { min: 5, max: 8, unit: 'days' }, second));
    expect(Date.parse(days)).toBeGreaterThan(Date.parse(START_DATE) + 4 * 86_400_000);
  });

  it('clamps every attribute to its valid range', () => {
    const changed = applyStatEffects({ health: 90, morale: 10, stress: 50, hunger: 50, fatigue: 50 }, {
      health: 50,
      morale: -50,
      stress: 80,
    });
    expect(changed).toEqual({ health: 100, morale: 0, stress: 100, hunger: 50, fatigue: 50 });
  });

  it('applies a choice and advances the complete state', () => {
    const initial = createNewGame(PROFILE, 19171111);
    const next = resolveChoice(initial, 'b');
    expect(next.turn).toBe(1);
    expect(Date.parse(next.currentDate)).toBeGreaterThan(Date.parse(initial.currentDate));
    expect(next.stats.morale).toBeGreaterThan(initial.stats.morale);
    expect(next.npcs.find((npc) => npc.id === 'james')?.relationship).toBeGreaterThan(38);
    expect(next.journal.some((entry) => entry.title === 'The road ends at the trenches')).toBe(true);
  });
});

describe('historical timeline', () => {
  it('triggers fixed events when their dates are crossed', () => {
    const state = createNewGame(PROFILE, 88);
    const crossed = triggerHistory(state, '1917-04-05T00:00:00.000Z', '1917-04-12T00:00:00.000Z');
    expect(crossed.map((record) => record.id)).toEqual(['america-enters-war', 'battle-of-arras']);
    expect(state.location).toBe('Arras sector');
    expect(state.pendingHistoryIds).toEqual(['america-enters-war', 'battle-of-arras']);
    expect(state.campaigns).toContain('Battle of Arras');
  });

  it('uses historical events as notices, not alternate-history branches', () => {
    const state = createNewGame(PROFILE, 99);
    triggerHistory(state, '1917-04-05T00:00:00.000Z', '1917-04-07T00:00:00.000Z');
    state.currentEventId = 'history:america-enters-war';
    const after = resolveChoice(state, 'a');
    expect(after.triggeredHistoryIds).toContain('america-enters-war');
    expect(after.pendingHistoryIds).not.toContain('america-enters-war');
  });
});

describe('death, NPCs, and endings', () => {
  it('ends a life whose health reaches zero', () => {
    const state = createNewGame(PROFILE, 7);
    state.stats.health = 0;
    const ended = resolveChoice(state, 'c');
    expect(ended.status).toBe('ended');
    expect(ended.ending?.type).toBe('wounds');
  });

  it('allows an unprotected NPC to die in a reproducible combat result', () => {
    let firstFatalState: GameState | undefined;
    for (let seed = 1; seed < 2000; seed += 1) {
      const state = createNewGame(PROFILE, seed);
      state.currentEventId = 'bombardment-dugout';
      const after = resolveChoice(state, 'a');
      if (after.npcs.some((npc) => npc.status === 'dead')) {
        firstFatalState = after;
        break;
      }
    }
    expect(firstFatalState).toBeDefined();
    expect(firstFatalState?.journal.some((entry) => entry.category === 'personnel')).toBe(true);
  });

  it('ends at exactly 11:00 on 11 November 1918', () => {
    const state = createNewGame(PROFILE, 19181111);
    state.currentDate = '1918-11-11T10:00:00.000Z';
    state.currentEventId = 'last-morning-fire';
    const ended = resolveChoice(state, 'b');
    expect(ended.currentDate).toBe(ARMISTICE_DATE);
    expect(ended.ending?.type).toBe('survived');
    expect(ended.triggeredHistoryIds).toContain('armistice');
  });
});

describe('requirements and reproducibility', () => {
  it('hides unavailable choices without hiding the entire game', () => {
    const state = createNewGame(PROFILE, 31337);
    expect(requirementsMet(state, { itemsAll: ['field_dressing'] })).toBe(false);
    expect(requirementsMet(state, { itemsAll: ['gas_mask'] })).toBe(true);
    expect(availableChoices(state, getCurrentEvent(state)).length).toBeGreaterThanOrEqual(2);
  });

  it('reproduces key outcomes for the same seed and choices', () => {
    let first = createNewGame(PROFILE, 424242);
    let second = createNewGame(PROFILE, 424242);
    for (let turn = 0; turn < 35 && first.status === 'playing' && second.status === 'playing'; turn += 1) {
      expect(first.currentEventId).toBe(second.currentEventId);
      const choiceId = availableChoices(first)[0].id;
      first = resolveChoice(first, choiceId);
      second = resolveChoice(second, choiceId);
    }
    expect(first).toEqual(second);
  });
});

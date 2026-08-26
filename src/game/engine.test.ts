import { describe, expect, it } from 'vitest';
import { COMBAT_EVENTS } from '../data/events/combat';
import { CHAPTER_EVENTS } from '../data/events/chapters';
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
  getChoiceConsequencePreview,
  getCurrentEvent,
  requirementsMet,
  resolveChoice,
  selectNextEvent,
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
    expect(RELATIONSHIP_EVENTS.length).toBeGreaterThanOrEqual(20);
    expect(CHAPTER_EVENTS).toHaveLength(6);
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

  it('binds every NPC casualty risk to a named participant', () => {
    for (const event of [...ROUTINE_EVENTS, ...COMBAT_EVENTS, ...RELATIONSHIP_EVENTS, ...CHAPTER_EVENTS]) {
      for (const choice of event.choices) {
        if (choice.risk?.npcDanger) expect(choice.npcId, `${event.id}:${choice.id}`).toBeTruthy();
      }
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

  it('previews clamped stat, relationship, item, and time effects exactly', () => {
    const state = createNewGame(PROFILE, 20260826);
    state.currentEventId = 'boots-drying';
    state.stats.health = 99;
    const event = getCurrentEvent(state);
    const preview = getChoiceConsequencePreview(state, availableChoices(state, event)[0], event);

    expect(preview.stats).toEqual([
      { key: 'health', delta: 1 },
      { key: 'stress', delta: -2 },
      { key: 'fatigue', delta: 2 },
    ]);
    expect(preview.addedItems).toEqual(['dry_socks']);
    expect(preview.advance).toEqual({ min: 7, max: 14, unit: 'days' });

    state.currentEventId = 'ration-tea';
    const social = availableChoices(state)[1];
    expect(getChoiceConsequencePreview(state, social).relationships).toEqual([{ npcId: 'edward', delta: 5 }]);
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
  it('uses post-choice condition for the displayed risk and records the resolved explanation', () => {
    const state = createNewGame(PROFILE, 20260826);
    state.currentEventId = 'bombardment-dugout';
    state.stats.fatigue = 69;
    state.weather = 'A pale, dry morning';
    const event = getCurrentEvent(state);
    const choice = availableChoices(state, event)[0];
    const preview = getChoiceConsequencePreview(state, choice, event);

    expect(preview.risk?.exposure).toEqual({ min: 0.108, max: 0.108 });
    expect(preview.risk?.immediateFatality).toEqual({ min: 0, max: 0 });
    expect(preview.risk!.criticalInjury.min).toBeGreaterThan(0);
    expect(preview.risk!.woundFatality.min).toBeGreaterThan(0);
    expect(preview.risk?.factors).toContainEqual({ key: 'highFatigue', direction: 'raises', percent: 20 });

    const resolved = resolveChoice(state, choice.id);
    const entry = resolved.journal.find((candidate) => candidate.eventId === event.id);
    expect(entry?.riskAssessment?.exposurePercent).toBe(10.8);
    expect(entry?.riskAssessment?.factors).toContainEqual({ key: 'highFatigue', direction: 'raises', percent: 20 });
  });

  it('shows protective equipment in the same risk calculation used by gas resolution', () => {
    const state = createNewGame(PROFILE, 17);
    state.currentEventId = 'gas-cloud';
    state.weather = 'Clear sky above the guns';
    const event = getCurrentEvent(state);
    const choice = availableChoices(state, event)[0];
    const preview = getChoiceConsequencePreview(state, choice, event);

    expect(preview.risk?.factors).toContainEqual({ key: 'protectiveEquipment', direction: 'lowers', percent: 62 });
    expect(preview.risk!.exposure.max).toBeLessThan(choice.risk!.danger);
  });

  it('shows field dressing and Alfie support in projected treatment outcomes', () => {
    const unsupported = createNewGame(PROFILE, 71);
    unsupported.currentEventId = 'bombardment-dugout';
    unsupported.weather = 'A pale, dry morning';
    unsupported.npcs = unsupported.npcs.map((npc) => npc.id === 'alfie' ? { ...npc, status: 'transferred' as const } : npc);
    const supported = structuredClone(unsupported);
    supported.inventory.push('field_dressing');
    supported.npcs = supported.npcs.map((npc) => npc.id === 'alfie'
      ? { ...npc, status: 'active' as const, relationship: 70 }
      : npc);
    const unsupportedRisk = getChoiceConsequencePreview(unsupported, availableChoices(unsupported)[0]).risk!;
    const supportedRisk = getChoiceConsequencePreview(supported, availableChoices(supported)[0]).risk!;

    expect(supportedRisk.treatmentFactors).toEqual([
      { key: 'fieldDressing', direction: 'lowers', percent: 10 },
      { key: 'alfieAid', direction: 'lowers', percent: 7 },
    ]);
    expect(supportedRisk.woundFatality.max).toBeLessThan(unsupportedRisk.woundFatality.max);
  });

  it('does not let hidden luck alter exposure or medical outcomes', () => {
    const unlucky = { ...createNewGame(PROFILE, 33), luck: 28 };
    unlucky.currentEventId = 'night-patrol';
    unlucky.weather = 'A pale, dry morning';
    const lucky = { ...structuredClone(unlucky), luck: 72 };
    const unluckyChoice = availableChoices(unlucky)[1];
    const luckyChoice = availableChoices(lucky)[1];

    expect(getChoiceConsequencePreview(unlucky, unluckyChoice).risk)
      .toEqual(getChoiceConsequencePreview(lucky, luckyChoice).risk);
  });

  it('prevents low-risk scenes from causing an immediate killed ending', () => {
    for (let seed = 1; seed <= 1500; seed += 1) {
      const state = createNewGame(PROFILE, seed);
      state.currentEventId = 'george-mining';
      const after = resolveChoice(state, 'c');
      expect(after.ending?.type, `seed ${seed}`).not.toBe('killed');
    }
  });

  it('ends a life whose health reaches zero', () => {
    const state = createNewGame(PROFILE, 7);
    state.stats.health = 0;
    const ended = resolveChoice(state, 'c');
    expect(ended.status).toBe('ended');
    expect(ended.ending?.type).toBe('wounds');
  });

  it('applies a combat casualty roll only to the named NPC', () => {
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
    expect(firstFatalState?.npcs.find((npc) => npc.id === 'george')?.status).toBe('dead');
    expect(firstFatalState?.npcs.filter((npc) => npc.id !== 'george').every((npc) => npc.status === 'active')).toBe(true);
    expect(firstFatalState?.journal.some((entry) => entry.category === 'personnel')).toBe(true);
  });

  it('substitutes a dead NPC with an alive one in choices', () => {
    const state = createNewGame(PROFILE, 42);
    // Kill Edward
    state.npcs = state.npcs.map((npc) => npc.id === 'edward' ? { ...npc, status: 'dead' as const } : npc);
    state.currentEventId = 'ration-tea';

    const choices = availableChoices(state);
    const edwardChoice = choices.find((c) => c.npcId === 'edward');
    // The choice that would have been "Give your mug to Edward" should now
    // reference a different NPC (not Edward, since he's dead)
    expect(edwardChoice).toBeUndefined();

    // There should be a choice with npcId set to a different (alive) NPC
    const substituteChoice = choices.find((c) => c.npcId !== undefined && c.npcId !== 'edward');
    expect(substituteChoice).toBeDefined();
    expect(substituteChoice!.label).not.toContain('Edward');
  });

  it('substitutes NPC name in choice text when the NPC is dead', () => {
    const state = createNewGame(PROFILE, 42);
    // Kill Edward
    state.npcs = state.npcs.map((npc) => npc.id === 'edward' ? { ...npc, status: 'dead' as const } : npc);
    state.currentEventId = 'ration-tea';

    const choices = availableChoices(state);
    // The "Give your mug to Edward" choice should be remapped to a different NPC
    const mugChoice = choices.find((c) => c.label.startsWith('Give your mug to'));
    expect(mugChoice).toBeDefined();
    expect(mugChoice!.label).not.toContain('Edward');
    // The npcId should no longer be 'edward'
    expect(mugChoice!.npcId).not.toBe('edward');
    // The npcId should be one of the alive NPCs
    const aliveIds = ['james', 'arthur', 'george', 'alfie'];
    expect(aliveIds).toContain(mugChoice!.npcId);
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

  it('carries an NPC choice into a delayed, branching personal story', () => {
    let state = createNewGame(PROFILE, 20260811);
    state.currentEventId = 'edward-first-shot';
    state = resolveChoice(state, 'c');

    expect(state.storyArcs.edward).toBe(1);
    expect(state.flags).toContain('edward_shamed');
    const birthday = state.scheduledEvents.find((event) => event.eventId === 'edward-age')!;
    state.turn = birthday.dueTurn;
    expect(selectNextEvent(state, new RandomCursor(state.rngState)).id).toBe('edward-age');

    state.currentEventId = 'edward-age';
    state = resolveChoice(state, 'a');
    const patrol = state.scheduledEvents.find((event) => event.eventId === 'edward-before-patrol')!;
    state.turn = patrol.dueTurn;
    state.currentEventId = 'edward-before-patrol';
    expect(availableChoices(state).map((choice) => choice.id)).toEqual(['b', 'c', 'd']);
  });

  it('turns a historical milestone into a scheduled chapter scene', () => {
    let state = createNewGame(PROFILE, 19170409);
    state.currentDate = '1917-04-09T06:00:00.000Z';
    triggerHistory(state, '1917-04-08T00:00:00.000Z', state.currentDate);
    state.currentEventId = 'history:battle-of-arras';
    state = resolveChoice(state, 'a');

    const chapter = state.scheduledEvents.find((event) => event.eventId === 'chapter-arras-tunnel')!;
    expect(chapter).toBeDefined();
    state.turn = chapter.dueTurn;
    expect(selectNextEvent(state, new RandomCursor(state.rngState)).id).toBe('chapter-arras-tunnel');
  });
});

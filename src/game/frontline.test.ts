import { describe, expect, it } from 'vitest';
import { FRONTLINE_EVENTS } from '../data/events/frontline';
import { availableChoices, createNewGame, getChoiceConsequencePreview, getCurrentEvent, resolveChoice } from './engine';
import { minutesLeft } from './frontline';
import { parseGame, serializeGame } from './save';
import { FRONTLINE_STAGES, type GameState } from './types';

const profile = { name: 'Thomas Miller', age: 19, occupation: 'Clerk', hometown: 'Leeds', family: 'Parents', enlisted: '1916' };
const start = (seed = 42) => resolveChoice(createNewGame(profile, seed), 'b');
function play(choices: string[], seed = 42): GameState {
  return choices.reduce((state, id) => resolveChoice(state, id), start(seed));
}
const safePreparation = ['promise', 'scout', 'medicine', 'cover', 'lane'];
const mutualPreparation = ['promise', 'rest', 'smoke', 'stretcher', 'crawl'];

describe('the orchard road mission', () => {
  it('starts after arrival and stays in ten consecutive scenes before returning to the war', () => {
    let state = start();
    const choices = [...safePreparation, 'flank', 'edward', 'lane', 'aid', 'remember'];
    for (const [index, choice] of choices.entries()) {
      expect(state.currentEventId).toBe(`frontline-${FRONTLINE_STAGES[index]}`);
      state = resolveChoice(state, choice);
    }
    expect(state.frontline?.status).toBe('completed');
    expect(state.currentEventId.startsWith('frontline-')).toBe(false);
    expect(state.flags).toEqual(expect.arrayContaining(['orchard-edward-saved', 'orchard-promise-kept', 'orchard-route-known']));
    expect(state.npcs.find((npc) => npc.id === 'edward')?.status).toBe('wounded');
    expect(state.inventory).toContain('field_dressing');
    expect(state.journal.filter((entry) => entry.eventId?.startsWith('frontline-'))).toHaveLength(10);
    expect(FRONTLINE_EVENTS).toHaveLength(10);
  });

  it('turns reconnaissance into later usable routes and shares previous medical supplies', () => {
    const known = play(safePreparation.slice(0, 4));
    const unknown = play(mutualPreparation.slice(0, 4));
    expect(availableChoices(known).some((choice) => choice.id === 'lane')).toBe(true);
    expect(availableChoices(unknown).some((choice) => choice.id === 'lane')).toBe(false);
    expect(() => resolveChoice(unknown, 'lane')).toThrow('unavailable');
    const arrival = createNewGame(profile, 42);
    arrival.inventory.push('field_dressing');
    const state = resolveChoice(arrival, 'b');
    expect(state.frontline?.dressings).toBe(2);
    expect(state.inventory).not.toContain('field_dressing');
  });

  it('prevents doing every preparation for free and uses saved game dates for lateness', () => {
    const late = play(['promise', 'scout', 'smoke', 'cover', 'lane']);
    const onTime = play(['promise', 'rest', 'smoke', 'cover', 'crawl']);
    expect(late.frontline?.preparationDelay).toBe(4);
    expect(minutesLeft(late.frontline!.evacuationDeadline!, late.currentDate)).toBe(24);
    expect(minutesLeft(onTime.frontline!.evacuationDeadline!, onTime.currentDate)).toBe(28);
  });

  it('makes both resource planning and cooperation viable ways to save Edward', () => {
    const planned = play([...safePreparation, 'flank', 'edward', 'lane', 'aid']);
    const assisted = play([...mutualPreparation, 'rush', 'together', 'stretcher', 'aid']);
    expect(planned.frontline?.edwardOutcome).toBe('saved');
    expect(planned.frontline?.playerWound).toBeUndefined();
    expect(assisted.frontline?.edwardOutcome).toBe('saved');
    expect(assisted.frontline?.playerWound?.stabilized).toBe(true);
    expect(assisted.frontline?.dressings).toBe(0);
    expect(assisted.stats.health).toBeLessThan(planned.stats.health);
    expect(planned.npcs.find((npc) => npc.id === 'george')?.status).toBe('active');
    expect(assisted.npcs.find((npc) => npc.id === 'george')?.status).toBe('active');
  });

  it('makes covering fire protect the player at an explicit cost to George', () => {
    const before = play(['promise', 'rest', 'medicine', 'cover']);
    const crossing = availableChoices(before).find((choice) => choice.id === 'open')!;
    expect(getChoiceConsequencePreview(before, crossing).frontline?.notices).toContain('georgeHit');
    const covered = play(['promise', 'rest', 'medicine', 'cover', 'open', 'rush', 'edward', 'road', 'aid']);
    expect(covered.frontline?.playerWound).toBeUndefined();
    expect(covered.frontline?.edwardOutcome).toBe('saved');
    expect(covered.frontline?.georgeWounded).toBe(true);
    expect(covered.npcs.find((npc) => npc.id === 'george')?.status).toBe('wounded');
    expect(covered.journal.flatMap((entry) => entry.frontlineNotices ?? []).filter((notice) => notice === 'georgeHit')).toHaveLength(1);
  });

  it('lets the safest crossing cost the rescue instead of automatically solving every goal', () => {
    const state = play(['promise', 'rest', 'smoke', 'cover', 'crawl', 'detour', 'evacuate', 'road', 'aid']);
    expect(state.status).toBe('playing');
    expect(state.frontline?.playerWound).toBeUndefined();
    expect(state.frontline?.edwardOutcome).toBe('dead');
    expect(state.flags).toContain('orchard-promise-broken');
    expect(state.journal.some((entry) => entry.frontlineNotices?.includes('edwardDied'))).toBe(true);
  });

  it('gives the player an intervention after a wound and explains death at its actual deadline', () => {
    const wounded = play(['self', 'rest', 'smoke', 'stretcher', 'open', 'rush']);
    expect(wounded.status).toBe('playing');
    expect(wounded.currentEventId).toBe('frontline-treatment');
    expect(wounded.frontline?.playerWound?.stabilized).toBe(false);
    expect(availableChoices(wounded).map((choice) => choice.id)).toContain('self');
    const treated = resolveChoice(wounded, 'together');
    const survivor = resolveChoice(resolveChoice(treated, 'stretcher'), 'aid');
    expect(survivor.status).toBe('playing');
    expect(survivor.frontline?.edwardOutcome).toBe('saved');
    const ignored = resolveChoice(wounded, 'edward');
    const death = resolveChoice(ignored, 'road');
    expect(death.ending?.type).toBe('wounds');
    expect(death.currentDate).toBe(wounded.frontline?.playerWound?.deadline);
    expect(death.ending?.cause).toContain('untreated bleeding');
    expect(death.stats.health).toBe(0);
    expect(death.journal.at(-1)?.frontlineNotices).toContain('playerDied');
  });

  it('does not reset the first untreated wound clock when hit again', () => {
    const firstHit = play(['self', 'rest', 'medicine', 'stretcher', 'open']);
    const secondHit = resolveChoice(firstHit, 'rush');
    expect(secondHit.frontline?.playerWound?.deadline).toBe(firstHit.frontline?.playerWound?.deadline);
  });

  it('does not let an already stabilized man survive abandonment', () => {
    const treated = play([...safePreparation, 'flank', 'edward']);
    expect(treated.frontline?.edwardWound?.stabilized).toBe(true);
    const abandoned = resolveChoice(resolveChoice(treated, 'alone'), 'aid');
    expect(abandoned.frontline?.edwardOutcome).toBe('dead');
    expect(abandoned.npcs.find((npc) => npc.id === 'edward')?.status).toBe('dead');
  });

  it('charges fatigue, missing the cart and fallback treatment in the forecast and resolution', () => {
    let state = play(['promise', 'scout', 'smoke', 'cover', 'lane', 'smoke', 'edward']);
    state.stats.fatigue = 70;
    const road = availableChoices(state).find((choice) => choice.id === 'road')!;
    expect(road.advance.min).toBe(14);
    state = resolveChoice(state, 'road');
    const aid = availableChoices(state)[0];
    expect(aid.advance.min).toBe(8);
    const forecast = getChoiceConsequencePreview(state, aid).frontline!;
    expect(forecast.notices).toContain('transportMissed');
    const result = resolveChoice(state, aid.id);
    expect(result.frontline?.transportMissed).toBe(true);
    expect(result.frontline).toEqual(forecast.result);
  });

  it('allows binding at the deadline before walking to the fallback post', () => {
    const state = play([...mutualPreparation, 'rush', 'evacuate', 'stretcher']);
    state.frontline!.evacuationDeadline = state.currentDate;
    state.frontline!.playerWound!.deadline = new Date(Date.parse(state.currentDate) + 4 * 60_000).toISOString();
    const withoutBinding = resolveChoice(state, 'aid');
    expect(withoutBinding.ending?.type).toBe('wounds');
    const withBinding = resolveChoice(state, 'bind');
    expect(withBinding.status).toBe('playing');
    expect(withBinding.frontline?.playerWound?.stabilized).toBe(true);
    expect(withBinding.frontline?.transportMissed).toBe(true);
    expect(withBinding.frontline?.dressings).toBe(0);
  });

  it('round-trips ongoing injury, preparation, supplies and deadlines without rerolling', () => {
    let state = start();
    for (const choice of [...mutualPreparation, 'rush', 'together', 'stretcher', 'aid', 'remember']) {
      const loaded = parseGame(serializeGame(state));
      expect(loaded).toEqual(state);
      expect(resolveChoice(loaded!, choice)).toEqual(resolveChoice(state, choice));
      state = resolveChoice(state, choice);
    }
  });

  it('keeps legacy saves playable but rejects corrupt mission deadlines and resources', () => {
    const legacy = createNewGame(profile, 11);
    expect(parseGame(serializeGame(legacy))?.frontline).toBeUndefined();
    const state = play([...mutualPreparation, 'rush']);
    for (const mutation of [
      (game: GameState) => { game.frontline!.dressings = -1; },
      (game: GameState) => { game.frontline!.playerWound!.deadline = 'invalid'; },
      (game: GameState) => { delete game.frontline; },
      (game: GameState) => { game.currentEventId = 'quiet-sector'; },
    ]) {
      const corrupted = structuredClone(state); mutation(corrupted);
      expect(parseGame(serializeGame(corrupted))).toBeNull();
    }
  });

  it('keeps every reachable branch playable and makes every forecast match its resolution', () => {
    let states = [start()];
    let endings = 0;
    for (let depth = 0; depth < 10; depth += 1) {
      const next: GameState[] = [];
      for (const state of states) {
        const event = getCurrentEvent(state);
        const choices = availableChoices(state, event);
        expect(choices.length).toBeGreaterThan(0);
        for (const choice of choices) {
          const forecast = getChoiceConsequencePreview(state, choice, event).frontline!;
          const result = resolveChoice(state, choice.id);
          expect(result.frontline).toEqual(forecast.result);
          expect(result.currentDate).toBe(forecast.date);
          expect(result.frontline!.dressings).toBeGreaterThanOrEqual(0);
          expect(parseGame(serializeGame(result))).toEqual(result);
          if (result.status === 'ended') endings += 1;
          else if (result.frontline?.status === 'active') next.push(result);
        }
      }
      states = next;
    }
    expect(states).toHaveLength(0);
    expect(endings).toBeGreaterThan(0);
  }, 20_000);
});

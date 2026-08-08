import { ARMISTICE_DATE } from './constants';
import { availableChoices, createNewGame, daysSurvived, getCurrentEvent, resolveChoice } from './engine';
import type { CharacterInput, EventChoice, GameState, SimulationSummary } from './types';

export type SimulationPolicy = 'balanced' | 'first' | 'second' | 'careful' | 'bold';

const SIM_CHARACTER: CharacterInput = {
  name: 'Thomas Miller',
  age: 19,
  occupation: 'Railway apprentice',
  hometown: 'Manchester',
  family: 'Parents and a younger sister at home',
  enlisted: 'September 1916',
};

function choiceScore(state: GameState, choice: EventChoice): number {
  const effects = choice.effects?.stats ?? {};
  let score = 0;
  score += (effects.health ?? 0) * 2.2;
  score += (effects.morale ?? 0) * (state.stats.morale < 35 ? 1.4 : 0.65);
  score -= (effects.stress ?? 0) * (state.stats.stress > 65 ? 1.35 : 0.6);
  score -= (effects.hunger ?? 0) * (state.stats.hunger > 65 ? 1.25 : 0.55);
  score -= (effects.fatigue ?? 0) * (state.stats.fatigue > 70 ? 1.2 : 0.5);
  score += Object.values(choice.effects?.relationships ?? {}).reduce((sum, value) => sum + value, 0) * 0.14;
  score -= (choice.risk?.danger ?? 0) * 58;
  if (choice.posture === 'careful') score += 1.2;
  return score;
}

export function autoplayChoice(state: GameState, policy: SimulationPolicy = 'balanced'): EventChoice {
  const choices = availableChoices(state);
  if (policy === 'first') return choices[0];
  if (policy === 'second') return choices[Math.min(1, choices.length - 1)];
  if (policy === 'careful') {
    return [...choices].sort((a, b) => {
      const posture = Number(b.posture === 'careful') - Number(a.posture === 'careful');
      return posture || (a.risk?.danger ?? 0) - (b.risk?.danger ?? 0) || choiceScore(state, b) - choiceScore(state, a);
    })[0];
  }
  if (policy === 'bold') {
    return [...choices].sort((a, b) => {
      const posture = Number(b.posture === 'bold') - Number(a.posture === 'bold');
      return posture || (b.risk?.danger ?? 0) - (a.risk?.danger ?? 0) || choiceScore(state, b) - choiceScore(state, a);
    })[0];
  }
  const ranked = [...choices].sort((a, b) => choiceScore(state, b) - choiceScore(state, a));
  // Mostly prudent, with reproducible human inconsistency so simulation does not model one perfect policy.
  const index = ((state.seed ^ Math.imul(state.turn + 1, 2654435761)) >>> 0) % 10;
  return index < 7 || ranked.length === 1 ? ranked[0] : ranked[Math.min(1, ranked.length - 1)];
}

export function simulateGame(seed: number, maxTurns = 260, policy: SimulationPolicy = 'balanced'): GameState {
  let state = createNewGame(SIM_CHARACTER, seed);
  while (state.status === 'playing' && state.turn < maxTurns) {
    const event = getCurrentEvent(state);
    const choices = availableChoices(state, event);
    if (choices.length === 0) break;
    state = resolveChoice(state, autoplayChoice(state, policy).id);
  }
  return state;
}

export function simulateMany(runs = 1000, baseSeed = 19171111, policy: SimulationPolicy = 'balanced'): SimulationSummary {
  const summary: SimulationSummary = {
    runs,
    survived: 0,
    killed: 0,
    wounds: 0,
    invalided: 0,
    pow: 0,
    stalled: 0,
    averageTurns: 0,
    averageDays: 0,
  };
  let turns = 0;
  let days = 0;
  for (let index = 0; index < runs; index += 1) {
    const state = simulateGame(baseSeed + Math.imul(index, 7919), 260, policy);
    turns += state.turn;
    days += daysSurvived(state);
    if (!state.ending) summary.stalled += 1;
    else summary[state.ending.type] += 1;
    if (state.ending?.type === 'survived' && state.currentDate !== ARMISTICE_DATE) {
      throw new Error('Survival ending did not occur at the armistice');
    }
  }
  summary.averageTurns = Math.round((turns / runs) * 10) / 10;
  summary.averageDays = Math.round((days / runs) * 10) / 10;
  return summary;
}

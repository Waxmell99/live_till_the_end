import { HISTORY_TIMELINE } from '../history';
import { LETTERS } from '../letters';
import type { GameEvent } from '../../game/types';
import { COMBAT_EVENTS } from './combat';
import { CHAPTER_EVENTS, HISTORY_FOLLOWUPS } from './chapters';
import { makeChoice } from './helpers';
import { RELATIONSHIP_EVENTS } from './relationships';
import { ROUTINE_EVENTS } from './routine';
import { FRONTLINE_EVENTS } from './frontline';

export const ARRIVAL_EVENT: GameEvent = {
  id: 'arrival-at-front',
  kind: 'routine',
  title: 'The road ends at the trenches',
  kicker: '12 February 1917 · Western Front',
  text: [
    'A guide leads the replacements past shuttered farms and trees cut down to splinters. The sound ahead is too continuous to be thunder.',
    'Arthur Hale checks your name, points out the aid post, and tells you never to leave your respirator beyond arm’s reach.',
  ],
  source: 'fictional',
  weight: 0,
  choices: [
    makeChoice('a', {
      label: 'Learn the trench layout', detail: 'Walk the route twice before dark.', posture: 'careful',
      effects: { stats: { fatigue: 5, stress: 3, morale: 3 }, relationships: { arthur: 4 } },
      outcome: 'You learn which turns flood, which dugout is safest, and where the latrine trench begins.',
    }, { min: 4, max: 7, unit: 'days' }),
    makeChoice('b', {
      label: 'Introduce yourself to the section', detail: 'Names may matter more than directions.', posture: 'social',
      effects: { stats: { morale: 6, stress: -2 }, relationships: { james: 3, arthur: 2, edward: 3, george: 2, alfie: 2 } },
      outcome: 'Five men make room around a smoky brazier. You repeat their names until you know them.',
    }, { min: 4, max: 7, unit: 'days' }),
    makeChoice('c', {
      label: 'Sleep while you can', detail: 'The journey has taken two nights.', posture: 'rest',
      effects: { stats: { fatigue: -9, stress: -2, morale: 1 } },
      outcome: 'You sleep in your coat while boots pass inches from your head.',
    }, { min: 5, max: 8, unit: 'days' }),
  ],
  tags: ['intro'],
};

export const HISTORICAL_EVENTS: GameEvent[] = HISTORY_TIMELINE.filter((record) => record.id !== 'armistice').map((record) => ({
  id: `history:${record.id}`,
  kind: 'historical',
  title: record.title,
  kicker: record.shortTitle,
  text: [record.summary],
  source: 'historical',
  weight: 0,
  historyId: record.id,
  choices: [
    makeChoice('a', {
      label: 'Read the notice carefully', detail: 'Take in what the official words actually say.', posture: 'careful',
      effects: { stats: { stress: 2, morale: 1 }, scheduleEvents: HISTORY_FOLLOWUPS[record.id] ? [{ eventId: HISTORY_FOLLOWUPS[record.id], afterTurns: 2, expiresAfterTurns: 18 }] : undefined },
      outcome: 'The paper gives dates and places. It cannot tell you what tomorrow will ask of you.',
    }, { min: 1, max: 3, unit: 'hours' }),
    makeChoice('b', {
      label: 'Talk it over with Arthur', detail: 'Separate what is known from trench rumour.', posture: 'social',
      effects: { stats: { stress: -1, morale: 2 }, relationships: { arthur: 3 }, scheduleEvents: HISTORY_FOLLOWUPS[record.id] ? [{ eventId: HISTORY_FOLLOWUPS[record.id], afterTurns: 2, expiresAfterTurns: 18 }] : undefined },
      outcome: 'Arthur is careful with what he does not know. The uncertainty remains, but it has edges.',
      npcId: 'arthur',
    }, { min: 1, max: 3, unit: 'hours' }),
    makeChoice('c', {
      label: 'Return to the day’s work', detail: 'History has not cancelled your duties.', posture: 'duty',
      effects: { stats: { fatigue: 2, stress: -1 }, scheduleEvents: HISTORY_FOLLOWUPS[record.id] ? [{ eventId: HISTORY_FOLLOWUPS[record.id], afterTurns: 2, expiresAfterTurns: 18 }] : undefined },
      outcome: 'The notice goes into a pocket. Rations, sentry duty, and mud still occupy the day.',
    }, { min: 2, max: 4, unit: 'hours' }),
  ],
}));

export const LETTER_EVENTS: GameEvent[] = LETTERS.map((letter) => ({
  id: `letter:${letter.id}`,
  kind: 'letter',
  title: letter.subject,
  kicker: `Letter from ${letter.from}`,
  text: letter.body,
  source: 'fictional',
  weight: 0.7,
  choices: letter.replyOptions.map((reply, index) => makeChoice(String.fromCharCode(97 + index), {
    label: reply.label,
    detail: reply.tone,
    posture: 'social',
    effects: { stats: reply.effects, receiveLetter: letter.id },
    outcome: reply.tone,
  }, { min: 3, max: 8, unit: 'days' })),
}));

export const PLAY_EVENTS: GameEvent[] = [
  ...ROUTINE_EVENTS,
  ...COMBAT_EVENTS,
  ...RELATIONSHIP_EVENTS,
  ...LETTER_EVENTS,
  ...CHAPTER_EVENTS,
];

export const ALL_EVENTS: GameEvent[] = [
  ARRIVAL_EVENT,
  ...FRONTLINE_EVENTS,
  ...PLAY_EVENTS,
  ...HISTORICAL_EVENTS,
];

const EVENT_MAP = new Map(ALL_EVENTS.map((event) => [event.id, event]));

export function eventById(id: string): GameEvent {
  const event = EVENT_MAP.get(id);
  if (!event) throw new Error(`Unknown event: ${id}`);
  return event;
}

import { HISTORY_TIMELINE, historyById } from '../data/history';
import { LETTERS } from '../data/letters';
import { createNpcStates, getNpc } from '../data/npcs';
import { eventById, PLAY_EVENTS } from '../data/events';
import { ARMISTICE_DATE, GAME_VERSION, INITIAL_STATS, START_DATE, WEATHER } from './constants';
import { normalizeSeed, RandomCursor } from './random';
import type {
  CharacterInput,
  CharacterProfile,
  ChoiceEffects,
  Ending,
  EventChoice,
  EventRequirements,
  GameEvent,
  GameState,
  HistoricalRecord,
  JournalEntry,
  NpcState,
  StatKey,
  Stats,
  TimeAdvance,
} from './types';

const FINAL_HOUR = '1918-11-11T10:00:00.000Z';
const STAT_KEYS: StatKey[] = ['health', 'morale', 'stress', 'hunger', 'fatigue'];

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function applyStatEffects(stats: Stats, effects: Partial<Stats> = {}): Stats {
  const next = { ...stats };
  for (const key of STAT_KEYS) {
    next[key] = clamp(next[key] + (effects[key] ?? 0));
  }
  return next;
}

function makeCharacter(input: CharacterInput): CharacterProfile {
  return {
    name: input.name.trim() || 'Thomas Miller',
    age: clamp(input.age || 19, 18, 49),
    nationality: 'British',
    occupation: input.occupation.trim() || 'Railway apprentice',
    hometown: input.hometown.trim() || 'Manchester',
    family: input.family.trim() || 'Parents and a younger sister at home',
    enlisted: input.enlisted.trim() || 'September 1916',
    birthYear: 1917 - clamp(input.age || 19, 18, 49),
  };
}

function initialHistory(): HistoricalRecord[] {
  const start = Date.parse(START_DATE);
  return HISTORY_TIMELINE.filter((record) => Date.parse(record.at) <= start);
}

export function createNewGame(input: CharacterInput, rawSeed: number): GameState {
  const seed = normalizeSeed(rawSeed);
  const rng = new RandomCursor(seed);
  const luck = rng.int(28, 72);
  const priorHistory = initialHistory();
  const character = makeCharacter(input);
  const journal: JournalEntry[] = [
    {
      id: 'enlistment-record',
      date: START_DATE,
      title: 'Posted to the Western Front',
      body: `${character.name}, formerly ${character.occupation.toLowerCase()} of ${character.hometown}, joined a front-line section.`,
      category: 'personnel',
    },
  ];

  return {
    version: GAME_VERSION,
    seed,
    rngState: rng.state,
    status: 'playing',
    turn: 0,
    startedAt: START_DATE,
    currentDate: START_DATE,
    character,
    stats: { ...INITIAL_STATS },
    luck,
    location: 'Arras rear area',
    weather: rng.pick(WEATHER),
    currentEventId: 'arrival-at-front',
    recentEventIds: [],
    pendingHistoryIds: [],
    triggeredHistoryIds: priorHistory.map((record) => record.id),
    campaigns: [],
    npcs: createNpcStates(),
    inventory: ['gas_mask', 'family_photo'],
    flags: [],
    letters: [],
    journal,
    lastResolution: [],
    updatedAt: START_DATE,
  };
}

export function requirementsMet(state: GameState, requirements?: EventRequirements): boolean {
  if (!requirements) return true;
  const now = Date.parse(state.currentDate);
  if (requirements.from && now < Date.parse(requirements.from)) return false;
  if (requirements.until && now > Date.parse(requirements.until)) return false;

  if (requirements.minStats) {
    for (const [key, value] of Object.entries(requirements.minStats) as Array<[StatKey, number]>) {
      if (state.stats[key] < value) return false;
    }
  }
  if (requirements.maxStats) {
    for (const [key, value] of Object.entries(requirements.maxStats) as Array<[StatKey, number]>) {
      if (state.stats[key] > value) return false;
    }
  }
  if (requirements.flagsAll?.some((flag) => !state.flags.includes(flag))) return false;
  if (requirements.flagsNone?.some((flag) => state.flags.includes(flag))) return false;
  if (requirements.itemsAll?.some((item) => !state.inventory.includes(item))) return false;
  if (requirements.historyTriggered && !state.triggeredHistoryIds.includes(requirements.historyTriggered)) return false;
  if (requirements.npcActive) {
    const npc = state.npcs.find((candidate) => candidate.id === requirements.npcActive);
    if (!npc || npc.status !== 'active') return false;
  }
  return true;
}

export function availableChoices(state: GameState, event: GameEvent = getCurrentEvent(state)): EventChoice[] {
  return event.choices.filter((choice) => requirementsMet(state, choice.requirements));
}

export function getCurrentEvent(state: GameState): GameEvent {
  return eventById(state.currentEventId);
}

function advanceMilliseconds(advance: TimeAdvance, rng: RandomCursor): number {
  const amount = rng.int(advance.min, advance.max);
  const multiplier = advance.unit === 'days' ? 86_400_000 : advance.unit === 'hours' ? 3_600_000 : 60_000;
  return amount * multiplier;
}

export function advanceGameTime(currentDate: string, advance: TimeAdvance, rng: RandomCursor): string {
  const current = Date.parse(currentDate);
  let next = current + advanceMilliseconds(advance, rng);
  const finalHour = Date.parse(FINAL_HOUR);
  const armistice = Date.parse(ARMISTICE_DATE);
  if (current < finalHour && next >= finalHour) next = finalHour;
  if (next > armistice) next = armistice;
  return new Date(next).toISOString();
}

function addUnique(target: string[], values: string[]): string[] {
  return [...new Set([...target, ...values])];
}

function removeValues(target: string[], values: string[]): string[] {
  const remove = new Set(values);
  return target.filter((value) => !remove.has(value));
}

function applyEffects(state: GameState, effects?: ChoiceEffects): void {
  if (!effects) return;
  state.stats = applyStatEffects(state.stats, effects.stats);
  if (effects.relationships) {
    state.npcs = state.npcs.map((npc) => ({
      ...npc,
      relationship: clamp(npc.relationship + (effects.relationships?.[npc.id] ?? 0)),
    }));
  }
  if (effects.addItems) state.inventory = addUnique(state.inventory, effects.addItems);
  if (effects.removeItems) state.inventory = removeValues(state.inventory, effects.removeItems);
  if (effects.addFlags) state.flags = addUnique(state.flags, effects.addFlags);
  if (effects.removeFlags) state.flags = removeValues(state.flags, effects.removeFlags);
}

function elapsedDays(from: string, to: string): number {
  return Math.max(0, (Date.parse(to) - Date.parse(from)) / 86_400_000);
}

function applyTimePressure(state: GameState, from: string, to: string, event: GameEvent): void {
  const days = elapsedDays(from, to);
  if (days <= 0) return;
  const hungerGain = Math.min(7, days * (event.tags?.includes('food') ? 0.15 : 0.42));
  const fatigueGain = Math.min(6, days * (event.tags?.includes('rest') ? -0.25 : 0.2));
  state.stats = applyStatEffects(state.stats, {
    hunger: hungerGain,
    fatigue: fatigueGain,
  });

  let attrition = 0;
  if (state.stats.hunger > 78) attrition += (state.stats.hunger - 75) / 16;
  if (state.stats.fatigue > 88) attrition += (state.stats.fatigue - 86) / 18;
  if (attrition > 0) state.stats.health = clamp(state.stats.health - Math.ceil(attrition));
  if (state.stats.stress > 82) state.stats.morale = clamp(state.stats.morale - 2);
}

function riskModifier(state: GameState, choice: EventChoice): number {
  let modifier = 1;
  if (state.stats.health < 45) modifier += 0.16;
  if (state.stats.fatigue > 70) modifier += 0.2;
  if (state.stats.stress > 72) modifier += 0.16;
  if (state.stats.morale < 25) modifier += 0.08;
  modifier += (50 - state.luck) / 220;
  if (choice.posture === 'careful') modifier *= 0.8;
  if (choice.posture === 'bold') modifier *= 1.16;
  if (choice.posture === 'rest') modifier *= 0.9;
  if (state.weather.includes('rain') || state.weather.includes('Sleet')) modifier *= 1.06;
  if (choice.risk?.mitigationItem && state.inventory.includes(choice.risk.mitigationItem)) modifier *= 0.38;
  return Math.max(0.35, modifier);
}

function npcIncident(state: GameState, rng: RandomCursor, directChance: number, messages: string[]): void {
  const active = state.npcs.filter((npc) => npc.status === 'active');
  if (active.length === 0 || rng.next() >= directChance) return;
  const selected = rng.pick(active);
  const definition = getNpc(selected.id);
  const outcome = rng.next();
  let status: NpcState['status'] = 'wounded';
  let epitaph = `Wounded near ${state.location}.`;
  if (outcome < 0.42) {
    status = 'dead';
    epitaph = `Killed near ${state.location}.`;
    state.stats = applyStatEffects(state.stats, { morale: -9, stress: 11 });
    messages.push(`${definition.name} was killed. His place in the section is empty.`);
  } else if (outcome < 0.52) {
    status = 'captured';
    epitaph = `Reported missing near ${state.location}; later confirmed captured.`;
    state.stats = applyStatEffects(state.stats, { morale: -5, stress: 7 });
    messages.push(`${definition.name} is missing after the action.`);
  } else {
    state.stats = applyStatEffects(state.stats, { morale: -3, stress: 5 });
    messages.push(`${definition.name} is wounded and taken to the aid post.`);
  }
  state.npcs = state.npcs.map((npc) => npc.id === selected.id ? {
    ...npc,
    status,
    statusDate: state.currentDate,
    epitaph,
  } : npc);
  state.journal.push({
    id: `npc-${selected.id}-${state.turn}`,
    date: state.currentDate,
    title: definition.name,
    body: epitaph,
    category: 'personnel',
  });
}

function postwarLife(state: GameState, rng: RandomCursor): string[] {
  const home = state.character.hometown;
  const occupation = state.character.occupation.toLowerCase();
  const lines = [
    `Returned to ${home} in 1919.`,
    rng.pick([
      `Went back to work as a ${occupation}.`,
      `Found work near home and kept it for many years.`,
      `Changed trades after returning, but kept the old tools.`,
    ]),
    rng.pick([
      'Married in the early 1920s and raised a family.',
      'Remained close to the families of men from the section.',
      'Kept the wartime diary in a drawer with family papers.',
    ]),
    rng.pick([
      'Rarely spoke about the war.',
      'Spoke about the men more often than the battles.',
      'Remembered particular sounds long after dates had faded.',
    ]),
  ];
  if (state.flags.includes('promised_alfie_visit')) {
    const alfie = state.npcs.find((npc) => npc.id === 'alfie');
    if (alfie?.status === 'active') lines.splice(2, 0, 'Kept the promise to visit Alfie’s bakery.');
  }
  return lines;
}

function endGame(state: GameState, type: Ending['type'], cause: string, finalEvent: string, rng: RandomCursor): void {
  state.status = 'ended';
  const ending: Ending = {
    type,
    date: state.currentDate,
    cause,
    finalEvent,
  };
  if (type === 'survived') ending.postwar = postwarLife(state, rng);
  if (type === 'invalided') {
    ending.postwar = [
      `Returned to Britain for treatment in ${new Date(state.currentDate).getUTCFullYear()}.`,
      `Was discharged from front-line service and survived the war.`,
      `Eventually returned to ${state.character.hometown}.`,
    ];
  }
  if (type === 'pow') {
    ending.postwar = [
      'Was held as a prisoner of war until the fighting ended.',
      `Returned to ${state.character.hometown} after repatriation.`,
      'Survival did not feel like a victory, but it was life.',
    ];
  }
  state.ending = ending;
  state.journal.push({
    id: `ending-${state.turn}`,
    date: state.currentDate,
    title: type === 'survived' ? 'The guns fell silent' : 'Final record',
    body: cause,
    category: 'ending',
  });
}

function resolveRisk(state: GameState, choice: EventChoice, rng: RandomCursor, messages: string[]): void {
  const risk = choice.risk;
  if (!risk) return;
  const danger = Math.min(0.65, risk.danger * riskModifier(state, choice));
  if (rng.next() < danger) {
    const outcome = rng.next();
    const capture = risk.capture ?? 0;
    const fatality = risk.fatality ?? 0.2;
    if (outcome < capture) {
      messages.push('Cut off from the section, you are taken prisoner.');
      endGame(state, 'pow', `Captured during ${risk.cause}.`, choice.outcome, rng);
      return;
    }
    if (outcome < capture + fatality) {
      state.stats.health = 0;
      messages.push('The section returns without you.');
      endGame(state, 'killed', `Killed by ${risk.cause}.`, choice.outcome, rng);
      return;
    }
    const [minimum, maximum] = risk.healthLoss ?? [10, 28];
    let loss = rng.int(minimum, maximum);
    if (state.inventory.includes('field_dressing')) loss = Math.round(loss * 0.78);
    state.stats.health = clamp(state.stats.health - loss);
    state.stats = applyStatEffects(state.stats, { stress: 7, morale: -4 });
    messages.push(`You are wounded (${loss} health lost), but remain alive.`);
    if (state.stats.health <= 0) {
      endGame(state, 'wounds', `Died of wounds after ${risk.cause}.`, choice.outcome, rng);
      return;
    }
    if (state.stats.health <= 18 && rng.next() < 0.46) {
      messages.push('The medical board rules that you cannot return to front-line service.');
      endGame(state, 'invalided', `Invalided home after wounds sustained during ${risk.cause}.`, choice.outcome, rng);
      return;
    }
  }
  npcIncident(state, rng, Math.min(0.22, (risk.npcDanger ?? 0) * riskModifier(state, choice)), messages);
}

export function triggerHistory(state: GameState, from: string, to: string): HistoricalRecord[] {
  const fromTime = Date.parse(from);
  const toTime = Date.parse(to);
  const crossed = HISTORY_TIMELINE.filter((record) => {
    const at = Date.parse(record.at);
    return at > fromTime && at <= toTime && !state.triggeredHistoryIds.includes(record.id);
  });

  for (const record of crossed) {
    state.triggeredHistoryIds.push(record.id);
    if (record.id !== 'armistice') state.pendingHistoryIds.push(record.id);
    if (record.location) state.location = record.location;
    if (record.campaign) state.campaigns = addUnique(state.campaigns, [record.campaign]);
    state.stats = applyStatEffects(state.stats, record.effects);
    state.journal.push({
      id: `history-${record.id}`,
      date: record.at,
      title: record.shortTitle,
      body: record.summary,
      category: 'historical',
    });
  }
  return crossed;
}

function maybeRecoverNpc(state: GameState, rng: RandomCursor, messages: string[]): void {
  const eligible = state.npcs.filter((npc) => npc.status === 'wounded' && npc.statusDate && elapsedDays(npc.statusDate, state.currentDate) > 28);
  if (eligible.length === 0 || rng.next() >= 0.11) return;
  const npc = rng.pick(eligible);
  const returns = rng.next() < 0.55;
  const definition = getNpc(npc.id);
  state.npcs = state.npcs.map((candidate) => candidate.id === npc.id ? {
    ...candidate,
    status: returns ? 'active' : 'transferred',
    epitaph: returns ? undefined : `Wounded near ${state.location}; transferred after treatment.`,
  } : candidate);
  messages.push(returns ? `${definition.name} returns to the section, thinner but walking.` : `${definition.name} will not return to the section after treatment.`);
}

function inActiveCampaign(date: string): boolean {
  const now = Date.parse(date);
  return HISTORY_TIMELINE.some((record) => record.campaign && record.end && Date.parse(record.at) <= now && now <= Date.parse(record.end));
}

function eventEligible(state: GameState, event: GameEvent): boolean {
  if (!requirementsMet(state, event.requirements)) return false;
  if (event.kind === 'letter') {
    const id = event.id.replace('letter:', '');
    if (state.letters.some((letter) => letter.id === id)) return false;
  }
  if (event.focusNpcId && state.npcs.find((npc) => npc.id === event.focusNpcId)?.status !== 'active') return false;
  return availableChoices(state, event).length > 0;
}

function chooseFromCategory(state: GameState, events: GameEvent[], rng: RandomCursor): GameEvent | undefined {
  let candidates = events.filter((event) => eventEligible(state, event));
  const withoutRecent = candidates.filter((event) => !state.recentEventIds.includes(event.id));
  if (withoutRecent.length > 0) candidates = withoutRecent;
  if (candidates.length === 0) return undefined;
  return rng.weighted(candidates, (event) => event.weight);
}

export function selectNextEvent(state: GameState, rng: RandomCursor): GameEvent {
  if (Date.parse(state.currentDate) >= Date.parse(FINAL_HOUR)) return eventById('last-morning-fire');
  const pending = state.pendingHistoryIds[0];
  if (pending) return eventById(`history:${pending}`);

  const eligible = PLAY_EVENTS.filter((event) => eventEligible(state, event));
  const combat = eligible.filter((event) => event.kind === 'combat');
  const relationships = eligible.filter((event) => event.kind === 'relationship');
  const letters = eligible.filter((event) => event.kind === 'letter');
  const routine = eligible.filter((event) => !['combat', 'relationship', 'letter'].includes(event.kind));

  const activeCampaign = inActiveCampaign(state.currentDate);
  const roll = rng.next();
  let selected: GameEvent | undefined;
  const combatChance = activeCampaign ? 0.34 : 0.08;
  const relationshipLimit = combatChance + 0.17;
  const letterLimit = relationshipLimit + (state.turn > 1 ? 0.11 : 0);
  if (roll < combatChance) selected = chooseFromCategory(state, combat, rng);
  else if (roll < relationshipLimit) selected = chooseFromCategory(state, relationships, rng);
  else if (roll < letterLimit) selected = chooseFromCategory(state, letters, rng);
  else selected = chooseFromCategory(state, routine, rng);

  return selected
    ?? chooseFromCategory(state, routine, rng)
    ?? chooseFromCategory(state, eligible, rng)
    ?? eventById('quiet-sector');
}

function recordLetter(state: GameState, event: GameEvent, choice: EventChoice): void {
  if (event.kind !== 'letter') return;
  const id = event.id.replace('letter:', '');
  if (!LETTERS.some((letter) => letter.id === id) || state.letters.some((letter) => letter.id === id)) return;
  state.letters.push({ id, receivedAt: state.currentDate, saved: true, repliedWith: choice.id });
}

function normaliseAfterTurn(state: GameState, rng: RandomCursor, outcome: string): void {
  if (state.status === 'ended') return;
  if (state.stats.health <= 0) {
    endGame(state, 'wounds', 'Died after accumulated wounds and illness.', outcome, rng);
    return;
  }
  if (state.stats.health <= 8 && rng.next() < 0.28) {
    endGame(state, 'invalided', 'Invalided home after prolonged illness and wounds.', outcome, rng);
    return;
  }
  if (Date.parse(state.currentDate) >= Date.parse(ARMISTICE_DATE)) {
    state.currentDate = ARMISTICE_DATE;
    if (!state.triggeredHistoryIds.includes('armistice')) triggerHistory(state, '1918-11-11T10:59:59.000Z', ARMISTICE_DATE);
    endGame(state, 'survived', 'The guns fell silent at eleven o’clock.', outcome, rng);
  }
}

export function resolveChoice(input: GameState, choiceId: string): GameState {
  if (input.status !== 'playing') return input;
  const state = structuredClone(input);
  const event = getCurrentEvent(state);
  const choice = availableChoices(state, event).find((candidate) => candidate.id === choiceId);
  if (!choice) throw new Error(`Choice ${choiceId} is unavailable for event ${event.id}`);

  const rng = new RandomCursor(state.rngState);
  const previousDate = state.currentDate;
  const messages = [choice.outcome];
  applyEffects(state, choice.effects);
  recordLetter(state, event, choice);

  if (event.kind === 'historical' && event.historyId) {
    state.pendingHistoryIds = state.pendingHistoryIds.filter((id) => id !== event.historyId);
  }

  state.currentDate = event.id === 'last-morning-fire'
    ? ARMISTICE_DATE
    : advanceGameTime(state.currentDate, choice.advance, rng);
  applyTimePressure(state, previousDate, state.currentDate, event);
  resolveRisk(state, choice, rng, messages);
  if (state.status === 'playing') maybeRecoverNpc(state, rng, messages);
  triggerHistory(state, previousDate, state.currentDate);

  state.turn += 1;
  state.journal.push({
    id: `turn-${state.turn}`,
    date: previousDate,
    title: event.title,
    body: messages.join(' '),
    category: event.kind,
  });
  state.lastResolution = messages;
  state.recentEventIds = [event.id, ...state.recentEventIds.filter((id) => id !== event.id)].slice(0, 7);
  state.weather = rng.pick(WEATHER);

  normaliseAfterTurn(state, rng, choice.outcome);
  if (state.status === 'playing') state.currentEventId = selectNextEvent(state, rng).id;
  state.rngState = rng.state;
  state.updatedAt = state.currentDate;
  return state;
}

export function daysSurvived(state: GameState): number {
  return Math.max(0, Math.floor(elapsedDays(state.startedAt, state.currentDate)));
}

export function currentCampaign(state: GameState): HistoricalRecord | undefined {
  const now = Date.parse(state.currentDate);
  return [...HISTORY_TIMELINE].reverse().find((record) => record.campaign && Date.parse(record.at) <= now);
}

export function discoveredHistory(state: GameState): HistoricalRecord[] {
  return state.triggeredHistoryIds.map(historyById).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

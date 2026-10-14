import { HISTORY_TIMELINE, historyById } from '../data/history';
import { LETTERS } from '../data/letters';
import { createNpcStates, getNpc } from '../data/npcs';
import { eventById, PLAY_EVENTS } from '../data/events';
import { ARMISTICE_DATE, GAME_VERSION, INITIAL_STATS, START_DATE, WEATHER } from './constants';
import { normalizeSeed, RandomCursor } from './random';
import { frontlineChoices, FRONTLINE_NOTICE_TEXT, isFrontlineEvent, resolveFrontlineAction, startFrontline, type FrontlineForecast } from './frontline';
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
  RiskFactor,
  StatKey,
  Stats,
  TimeAdvance,
} from './types';

const FINAL_HOUR = '1918-11-11T10:00:00.000Z';
const STAT_KEYS: StatKey[] = ['health', 'morale', 'stress', 'hunger', 'fatigue'];
const STORY_ARC_IDS = ['james', 'arthur', 'edward', 'george', 'alfie'];
const INTERRUPTIBLE_STORY_ARCS = new Set(['edward', 'george']);

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
  const priorHistory = initialHistory();
  const character = makeCharacter(input);
  const journal: JournalEntry[] = [
    {
      id: 'enlistment-record',
      date: START_DATE,
      title: 'Posted to the Western Front',
      body: `${character.name}, formerly ${character.occupation.toLowerCase()} of ${character.hometown}, joined a front-line section.`,
      category: 'personnel',
      eventId: 'initial-record',
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
    eventMemory: {},
    storyArcs: Object.fromEntries(STORY_ARC_IDS.map((id) => [id, 0])),
    scheduledEvents: [],
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
  if (requirements.flagsAny && !requirements.flagsAny.some((flag) => state.flags.includes(flag))) return false;
  if (requirements.flagsNone?.some((flag) => state.flags.includes(flag))) return false;
  if (requirements.itemsAll?.some((item) => !state.inventory.includes(item))) return false;
  if (requirements.historyTriggered && !state.triggeredHistoryIds.includes(requirements.historyTriggered)) return false;
  if (requirements.npcActive) {
    const npc = state.npcs.find((candidate) => candidate.id === requirements.npcActive);
    if (!npc || npc.status !== 'active') return false;
  }
  if (requirements.npcStatuses) {
    for (const [id, allowed] of Object.entries(requirements.npcStatuses)) {
      const status = state.npcs.find((npc) => npc.id === id)?.status;
      const statuses = Array.isArray(allowed) ? allowed : [allowed];
      if (!status || !statuses.includes(status)) return false;
    }
  }
  if (requirements.minRelationships) {
    for (const [id, value] of Object.entries(requirements.minRelationships)) {
      if ((state.npcs.find((npc) => npc.id === id)?.relationship ?? 0) < value) return false;
    }
  }
  if (requirements.maxRelationships) {
    for (const [id, value] of Object.entries(requirements.maxRelationships)) {
      if ((state.npcs.find((npc) => npc.id === id)?.relationship ?? 100) > value) return false;
    }
  }
  if (requirements.arcStages) {
    for (const [id, value] of Object.entries(requirements.arcStages)) {
      if ((state.storyArcs?.[id] ?? 0) !== value) return false;
    }
  }
  return true;
}

/**
 * Picks a deterministic "random" alive NPC from the section, excluding the given id.
 * Uses turn number and event id for determinism so the same choice always resolves to the same substitute.
 * Returns null if no alive NPCs (other than the excluded one) are available.
 */
function pickRandomAliveNpc(state: GameState, excludeId?: string): { id: string; name: string } | null {
  const alive = state.npcs.filter((npc) => npc.status === 'active' && npc.id !== excludeId);
  if (alive.length === 0) return null;
  const index = (state.turn * 7 + state.currentEventId.length * 13) % alive.length;
  const npc = alive[index];
  return { id: npc.id, name: getNpc(npc.id).name };
}

/**
 * If a choice references a specific NPC via npcId and that NPC is no longer active (dead/wounded/etc.),
 * substitutes the dead NPC's name with a random alive comrade's name and remaps relationship effects.
 * Returns the original choice unchanged if no substitution is needed or possible.
 */
function substituteChoiceNpc(choice: EventChoice, state: GameState): EventChoice {
  if (!choice.npcId) return choice;
  const npc = state.npcs.find((n) => n.id === choice.npcId);
  if (!npc || npc.status === 'active') return choice;

  const substitute = pickRandomAliveNpc(state, choice.npcId);
  if (!substitute) return choice; // No alive NPC to substitute — keep the original

  const deadNpc = getNpc(choice.npcId);
  const deadFirstName = deadNpc.name.split(/\s+/)[0];
  const subFirstName = substitute.name.split(/\s+/)[0];

  // Substitute name in text fields (using first names only, since that's what appears in choice text)
  const newLabel = choice.label.replaceAll(deadFirstName, subFirstName);
  const newDetail = choice.detail.replaceAll(deadFirstName, subFirstName);
  const newOutcome = choice.outcome.replaceAll(deadFirstName, subFirstName);

  // Remap relationship effects from the dead NPC to the substitute
  let newEffects = choice.effects;
  if (newEffects?.relationships && newEffects.relationships[choice.npcId] !== undefined) {
    const { [choice.npcId]: relValue, ...remainingRelationships } = newEffects.relationships;
    newEffects = {
      ...newEffects,
      relationships: {
        ...remainingRelationships,
        [substitute.id]: (remainingRelationships[substitute.id] ?? 0) + relValue,
      },
    };
  }

  return {
    ...choice,
    npcId: substitute.id,
    label: newLabel,
    detail: newDetail,
    outcome: newOutcome,
    effects: newEffects,
  };
}

export function availableChoices(state: GameState, event: GameEvent = getCurrentEvent(state)): EventChoice[] {
  const choices = isFrontlineEvent(event.id) ? frontlineChoices(state, event.choices) : event.choices;
  return choices
    .filter((choice) => requirementsMet(state, choice.requirements))
    .map((choice) => substituteChoiceNpc(choice, state));
}

export function getCurrentEvent(state: GameState): GameEvent {
  return eventById(state.currentEventId);
}

function advanceMilliseconds(advance: TimeAdvance, rng: RandomCursor): number {
  const amount = rng.int(advance.min, advance.max);
  const multiplier = advance.unit === 'days' ? 86_400_000 : advance.unit === 'hours' ? 3_600_000 : 60_000;
  return amount * multiplier;
}

function advanceByAmount(currentDate: string, advance: TimeAdvance, amount: number): string {
  const multiplier = advance.unit === 'days' ? 86_400_000 : advance.unit === 'hours' ? 3_600_000 : 60_000;
  const current = Date.parse(currentDate);
  let next = current + amount * multiplier;
  const finalHour = Date.parse(FINAL_HOUR);
  const armistice = Date.parse(ARMISTICE_DATE);
  if (current < finalHour && next >= finalHour) next = finalHour;
  if (next > armistice) next = armistice;
  return new Date(next).toISOString();
}

export function advanceGameTime(currentDate: string, advance: TimeAdvance, rng: RandomCursor): string {
  const elapsed = advanceMilliseconds(advance, rng);
  const multiplier = advance.unit === 'days' ? 86_400_000 : advance.unit === 'hours' ? 3_600_000 : 60_000;
  return advanceByAmount(currentDate, advance, elapsed / multiplier);
}

function addUnique(target: string[], values: string[]): string[] {
  return [...new Set([...target, ...values])];
}

function removeValues(target: string[], values: string[]): string[] {
  const remove = new Set(values);
  return target.filter((value) => !remove.has(value));
}

function ensureNarrativeState(state: GameState): void {
  state.eventMemory ??= {};
  state.storyArcs ??= Object.fromEntries(STORY_ARC_IDS.map((id) => [id, 0]));
  state.scheduledEvents ??= [];
  const needsJournalRecovery = Object.keys(state.eventMemory).length === 0
    && state.journal.some((entry) => entry.eventId && entry.eventId !== 'initial-record');
  if (!needsJournalRecovery) return;

  for (const entry of state.journal) {
    if (!entry.eventId || entry.eventId === 'initial-record') continue;
    if (!state.eventMemory[entry.eventId]) {
      const matching = state.journal.filter((candidate) => candidate.eventId === entry.eventId);
      const last = matching[matching.length - 1];
      const parsedTurn = Number(last.id.replace('turn-', ''));
      state.eventMemory[entry.eventId] = {
        count: matching.length,
        lastTurn: Number.isFinite(parsedTurn) ? parsedTurn : 0,
        lastChoiceId: last.choiceId ?? '',
      };
    }
    try {
      const event = eventById(entry.eventId);
      if (event.arcId !== undefined && event.arcStage !== undefined) {
        state.storyArcs[event.arcId] = Math.max(state.storyArcs[event.arcId] ?? 0, event.arcStage + 1);
      }
    } catch {
      // Old saves may reference content removed in a later release.
    }
  }
}

function storyArcForScheduledEvent(eventId: string): string | undefined {
  try {
    return eventById(eventId).arcId;
  } catch {
    return undefined;
  }
}

function scheduleInterruptedStoryClosure(state: GameState, npcId: string, status: NpcState['status']): void {
  if (!INTERRUPTIBLE_STORY_ARCS.has(npcId) || status === 'active') return;
  const stage = state.storyArcs[npcId] ?? 0;
  if (stage <= 0 || stage >= 4) return;
  const eventId = `${npcId}-story-${status}`;
  state.scheduledEvents = state.scheduledEvents.filter((item) => storyArcForScheduledEvent(item.eventId) !== npcId);
  state.scheduledEvents.push({ eventId, dueTurn: state.turn + 1, expiresTurn: state.turn + 16 });
}

function ensureInterruptedStoryClosures(state: GameState): void {
  for (const npc of state.npcs) scheduleInterruptedStoryClosure(state, npc.id, npc.status);
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
  if (effects.setArcStages) state.storyArcs = { ...state.storyArcs, ...effects.setArcStages };
  if (effects.setNpcStatuses) {
    state.npcs = state.npcs.map((npc) => effects.setNpcStatuses?.[npc.id] ? {
      ...npc,
      status: effects.setNpcStatuses[npc.id],
      statusDate: state.currentDate,
    } : npc);
  }
  if (effects.scheduleEvents) {
    for (const scheduled of effects.scheduleEvents) {
      const dueTurn = state.turn + Math.max(1, scheduled.afterTurns);
      const expiresTurn = dueTurn + (scheduled.expiresAfterTurns ?? 18);
      state.scheduledEvents = [
        ...state.scheduledEvents.filter((item) => item.eventId !== scheduled.eventId),
        { eventId: scheduled.eventId, dueTurn, expiresTurn },
      ];
    }
  }
}

function elapsedDays(from: string, to: string): number {
  return Math.max(0, (Date.parse(to) - Date.parse(from)) / 86_400_000);
}

function applyTimePressure(state: GameState, from: string, to: string, event: GameEvent): void {
  const days = elapsedDays(from, to);
  if (days <= 0) return;
  // A turn spanning days also implies ordinary issued meals and fragments of sleep.
  // These are slow background pressures; explicit event choices create the sharp changes.
  const hungerGain = Math.min(2.5, days * (event.tags?.includes('food') ? -0.08 : 0.06));
  const fatigueGain = Math.min(2.5, days * (event.tags?.includes('rest') ? -0.22 : 0.035));
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

interface ChanceRange {
  min: number;
  max: number;
}

export interface ChoiceRiskAssessment {
  exposure: ChanceRange;
  injury: ChanceRange;
  criticalInjury: ChanceRange;
  immediateFatality: ChanceRange;
  woundFatality: ChanceRange;
  invalided: ChanceRange;
  capture: ChanceRange;
  comradeIncident?: ChanceRange;
  comradeId?: string;
  factors: RiskFactor[];
  treatmentFactors: RiskFactor[];
}

export interface ChoiceConsequencePreview {
  stats: Array<{ key: StatKey; delta: number }>;
  relationships: Array<{ npcId: string; delta: number }>;
  addedItems: string[];
  removedItems: string[];
  affectsStory: boolean;
  risk?: ChoiceRiskAssessment;
  frontline?: FrontlineForecast;
}

interface CalculatedRisk {
  exposure: number;
  injury: number;
  criticalInjury: number;
  immediateFatality: number;
  woundFatality: number;
  invalided: number;
  capture: number;
  comradeIncident?: number;
  comradeId?: string;
  factors: RiskFactor[];
  treatmentFactors: RiskFactor[];
}

type InjurySeverity = 'minor' | 'serious' | 'critical' | 'catastrophic';

interface InjuryShares {
  minor: number;
  serious: number;
  critical: number;
  catastrophic: number;
}

function riskModifier(state: GameState, choice: EventChoice): { value: number; factors: RiskFactor[] } {
  let modifier = 1;
  const factors: RiskFactor[] = [];
  const add = (key: RiskFactor['key'], amount: number) => {
    modifier += amount;
    factors.push({ key, direction: amount >= 0 ? 'raises' : 'lowers', percent: Math.round(Math.abs(amount) * 100) });
  };
  const multiply = (key: RiskFactor['key'], amount: number) => {
    modifier *= amount;
    factors.push({ key, direction: amount >= 1 ? 'raises' : 'lowers', percent: Math.round(Math.abs(amount - 1) * 100) });
  };

  if (state.stats.health < 45) add('lowHealth', 0.16);
  if (state.stats.fatigue > 70) add('highFatigue', 0.2);
  if (state.stats.stress > 72) add('highStress', 0.16);
  if (state.stats.morale < 25) add('lowMorale', 0.08);
  if (choice.posture === 'careful') multiply('carefulPosture', 0.8);
  if (choice.posture === 'bold') multiply('boldPosture', 1.16);
  if (choice.posture === 'rest') multiply('restPosture', 0.9);
  if (state.weather.includes('rain') || state.weather.includes('Sleet')) multiply('badWeather', 1.06);
  if (choice.risk?.mitigationItem && state.inventory.includes(choice.risk.mitigationItem)) multiply('protectiveEquipment', 0.38);
  return { value: Math.max(0.35, modifier), factors };
}

function injuryShares(choice: EventChoice): InjuryShares {
  const risk = choice.risk!;
  const lethality = Math.max(0.05, Math.min(0.65, risk.fatality ?? 0.2));
  // Low-risk scenes can still cause serious harm, but never an unmediated instant death.
  const catastrophic = risk.danger >= 0.12 ? lethality * 0.5 : 0;
  const critical = lethality * (risk.danger < 0.06 ? 0.35 : risk.danger < 0.12 ? 0.7 : 0.9);
  const serious = Math.min(0.5, 0.18 + lethality * 0.45);
  const minor = Math.max(0, 1 - catastrophic - critical - serious);
  const total = minor + serious + critical + catastrophic;
  return {
    minor: minor / total,
    serious: serious / total,
    critical: critical / total,
    catastrophic: catastrophic / total,
  };
}

function injuryLoss(state: GameState, severity: Exclude<InjurySeverity, 'catastrophic'>, baseLoss: number): number {
  const multiplier = severity === 'minor' ? 0.55 : severity === 'critical' ? 1.35 : 1;
  let loss = Math.max(1, Math.round(baseLoss * multiplier));
  if (state.inventory.includes('field_dressing')) loss = Math.max(1, Math.round(loss * 0.78));
  return loss;
}

function treatmentSupport(state: GameState): { reduction: number; factors: RiskFactor[] } {
  let reduction = 0;
  const factors: RiskFactor[] = [];
  if (state.inventory.includes('field_dressing')) {
    reduction += 0.1;
    factors.push({ key: 'fieldDressing', direction: 'lowers', percent: 10 });
  }
  const alfie = state.npcs.find((npc) => npc.id === 'alfie' && npc.status === 'active');
  if (alfie) {
    const aid = alfie.relationship >= 60 ? 0.07 : 0.04;
    reduction += aid;
    factors.push({ key: 'alfieAid', direction: 'lowers', percent: Math.round(aid * 100) });
  }
  return { reduction, factors };
}

function treatmentDeathChance(state: GameState, severity: Exclude<InjurySeverity, 'catastrophic'>): number {
  if (severity !== 'critical') return 0;
  let chance = 0.18;
  chance += Math.max(0, 40 - state.stats.health) / 75;
  chance += Math.max(0, state.stats.fatigue - 70) / 250;
  chance += Math.max(0, state.stats.hunger - 70) / 320;
  chance -= treatmentSupport(state).reduction;
  return Math.max(0.03, Math.min(0.78, chance));
}

function invalidedChance(state: GameState, severity: Exclude<InjurySeverity, 'catastrophic'>): number {
  if (severity === 'critical') return Math.min(0.45, 0.12 + Math.max(0, 40 - state.stats.health) / 180);
  if (severity === 'serious') {
    if (state.stats.health <= 25) return 0.15;
    if (state.stats.health <= 40) return 0.06;
  }
  if (severity === 'minor' && state.stats.health <= 18) return 0.05;
  return 0;
}

function averageMedicalOutcomes(
  state: GameState,
  choice: EventChoice,
  severity: Exclude<InjurySeverity, 'catastrophic'>,
): { death: number; invalided: number } {
  const [minimum, maximum] = choice.risk?.healthLoss ?? [10, 28];
  let death = 0;
  let invalided = 0;
  const count = maximum - minimum + 1;
  for (let baseLoss = minimum; baseLoss <= maximum; baseLoss += 1) {
    const candidate: GameState = {
      ...state,
      stats: {
        ...state.stats,
        health: clamp(state.stats.health - injuryLoss(state, severity, baseLoss)),
      },
    };
    const deathChance = candidate.stats.health <= 0 ? 1 : treatmentDeathChance(candidate, severity);
    death += deathChance;
    if (candidate.stats.health > 0) invalided += (1 - deathChance) * invalidedChance(candidate, severity);
  }
  return { death: death / count, invalided: invalided / count };
}

function calculateExposure(state: GameState, choice: EventChoice): { exposure: number; factors: RiskFactor[] } | undefined {
  if (!choice.risk) return undefined;
  const modifier = riskModifier(state, choice);
  return {
    exposure: Math.min(0.65, choice.risk.danger * modifier.value),
    factors: modifier.factors,
  };
}

function calculateRisk(state: GameState, choice: EventChoice): CalculatedRisk | undefined {
  const risk = choice.risk;
  if (!risk) return undefined;
  const modifier = riskModifier(state, choice);
  const exposure = Math.min(0.65, risk.danger * modifier.value);
  const captureShare = Math.max(0, Math.min(1, risk.capture ?? 0));
  const shares = injuryShares(choice);
  const exposedAndFree = exposure * (1 - captureShare);
  const capture = exposure * captureShare;
  const immediateFatality = exposedAndFree * shares.catastrophic;
  const medical = (['minor', 'serious', 'critical'] as const).map((severity) => ({
    severity,
    share: shares[severity],
    ...averageMedicalOutcomes(state, choice, severity),
  }));
  const woundFatality = exposedAndFree * medical.reduce((sum, outcome) => sum + outcome.share * outcome.death, 0);
  const invalided = exposedAndFree * medical.reduce((sum, outcome) => sum + outcome.share * outcome.invalided, 0);
  const injury = exposedAndFree * (1 - shares.catastrophic);
  const criticalInjury = exposedAndFree * shares.critical;
  const canReachComradeRoll = 1 - capture - immediateFatality - woundFatality - invalided;
  const target = choice.npcId
    ? state.npcs.find((npc) => npc.id === choice.npcId && npc.status === 'active')
    : undefined;
  const comradeIncident = risk.npcDanger && target
    ? Math.min(0.22, risk.npcDanger * modifier.value) * canReachComradeRoll
    : undefined;
  return {
    exposure,
    injury,
    criticalInjury,
    immediateFatality,
    woundFatality,
    invalided,
    capture,
    comradeIncident,
    comradeId: comradeIncident ? target?.id : undefined,
    factors: modifier.factors,
    treatmentFactors: treatmentSupport(state).factors,
  };
}

function range(first: number, second: number): ChanceRange {
  return { min: Math.min(first, second), max: Math.max(first, second) };
}

export function getChoiceConsequencePreview(
  state: GameState,
  choice: EventChoice,
  event: GameEvent = getCurrentEvent(state),
): ChoiceConsequencePreview {
  const afterEffects = structuredClone(state);
  applyEffects(afterEffects, choice.effects);
  let frontline: FrontlineForecast | undefined;
  if (isFrontlineEvent(event.id) && state.frontline?.status === 'active') {
    afterEffects.currentDate = advanceByAmount(state.currentDate, choice.advance, choice.advance.min);
    const notices = resolveFrontlineAction(afterEffects, choice, state.currentDate);
    frontline = {
      minutes: (Date.parse(afterEffects.currentDate) - Date.parse(state.currentDate)) / 60_000,
      dressingsDelta: afterEffects.frontline!.dressings - state.frontline.dressings,
      smokeUsed: state.frontline.smoke && !afterEffects.frontline!.smoke,
      notices, result: afterEffects.frontline!, date: afterEffects.currentDate,
    };
  }
  const stats = STAT_KEYS.map((key) => ({ key, delta: afterEffects.stats[key] - state.stats[key] }))
    .filter(({ delta }) => delta !== 0);
  const relationships = afterEffects.npcs.map((npc) => ({
    npcId: npc.id,
    delta: npc.relationship - (state.npcs.find((current) => current.id === npc.id)?.relationship ?? npc.relationship),
  })).filter(({ delta }) => delta !== 0);
  const addedItems = afterEffects.inventory.filter((item) => !state.inventory.includes(item));
  const removedItems = state.inventory.filter((item) => !afterEffects.inventory.includes(item));
  const affectsStory = Boolean(
    choice.effects?.addFlags?.length
    || choice.effects?.removeFlags?.length
    || choice.effects?.receiveLetter
    || choice.effects?.setArcStages
    || choice.effects?.setNpcStatuses
    || choice.effects?.scheduleEvents?.length,
  );

  let risk: ChoiceRiskAssessment | undefined;
  if (choice.risk) {
    const states = [choice.advance.min, choice.advance.max].map((amount) => {
      const candidate = structuredClone(afterEffects);
      const nextDate = event.id === 'last-morning-fire'
        ? '1918-11-11T10:58:00.000Z'
        : advanceByAmount(state.currentDate, choice.advance, amount);
      applyTimePressure(candidate, state.currentDate, nextDate, event);
      return calculateRisk(candidate, choice)!;
    });
    const [minimum, maximum] = states;
    const factorMap = new Map<string, RiskFactor>();
    for (const factor of [...minimum.factors, ...maximum.factors]) {
      factorMap.set(`${factor.key}:${factor.direction}`, factor);
    }
    risk = {
      exposure: range(minimum.exposure, maximum.exposure),
      injury: range(minimum.injury, maximum.injury),
      criticalInjury: range(minimum.criticalInjury, maximum.criticalInjury),
      immediateFatality: range(minimum.immediateFatality, maximum.immediateFatality),
      woundFatality: range(minimum.woundFatality, maximum.woundFatality),
      invalided: range(minimum.invalided, maximum.invalided),
      capture: range(minimum.capture, maximum.capture),
      comradeIncident: minimum.comradeIncident !== undefined && maximum.comradeIncident !== undefined
        ? range(minimum.comradeIncident, maximum.comradeIncident)
        : undefined,
      comradeId: minimum.comradeId ?? maximum.comradeId,
      factors: [...factorMap.values()],
      treatmentFactors: [...new Map([...minimum.treatmentFactors, ...maximum.treatmentFactors]
        .map((factor) => [`${factor.key}:${factor.direction}`, factor])).values()],
    };
  }

  return { stats, relationships, addedItems, removedItems, affectsStory: affectsStory || Boolean(frontline), risk, frontline };
}

function npcIncident(state: GameState, rng: RandomCursor, npcId: string | undefined, directChance: number, messages: string[]): void {
  const selected = state.npcs.find((npc) => npc.id === npcId && npc.status === 'active');
  if (!selected || rng.next() >= directChance) return;
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
  scheduleInterruptedStoryClosure(state, selected.id, status);
  state.journal.push({
    id: `npc-${selected.id}-${state.turn}`,
    date: state.currentDate,
    title: definition.name,
    body: epitaph,
    category: 'personnel',
    npcId: selected.id,
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
    endingType: type,
  });
}

function resolveRisk(state: GameState, choice: EventChoice, rng: RandomCursor, messages: string[]): void {
  const risk = choice.risk;
  if (!risk) return;
  const exposure = calculateExposure(state, choice)!.exposure;
  if (rng.next() < exposure) {
    const capture = Math.max(0, Math.min(1, risk.capture ?? 0));
    if (rng.next() < capture) {
      messages.push('Cut off from the section, you are taken prisoner.');
      endGame(state, 'pow', `Captured during ${risk.cause}.`, choice.outcome, rng);
      return;
    }

    const shares = injuryShares(choice);
    const severityRoll = rng.next();
    const severity: InjurySeverity = severityRoll < shares.catastrophic
      ? 'catastrophic'
      : severityRoll < shares.catastrophic + shares.critical
        ? 'critical'
        : severityRoll < shares.catastrophic + shares.critical + shares.serious
          ? 'serious'
          : 'minor';

    if (severity === 'catastrophic') {
      state.stats.health = 0;
      messages.push('The hit is catastrophic. The section returns without you.');
      endGame(state, 'killed', `Killed by ${risk.cause}.`, choice.outcome, rng);
      return;
    }

    const [minimum, maximum] = risk.healthLoss ?? [10, 28];
    const baseLoss = rng.int(minimum, maximum);
    const loss = injuryLoss(state, severity, baseLoss);
    state.stats.health = clamp(state.stats.health - loss);
    const shock = severity === 'critical' ? { stress: 13, morale: -8 }
      : severity === 'serious' ? { stress: 9, morale: -5 }
        : { stress: 5, morale: -2 };
    state.stats = applyStatEffects(state.stats, shock);
    messages.push(`You suffer a ${severity} wound (${loss} health lost).`);
    if (state.inventory.includes('field_dressing')) messages.push('Your field dressing slows the bleeding before evacuation.');
    if (state.stats.health <= 0) {
      messages.push('The wound proves fatal before treatment can stabilise you.');
      endGame(state, 'wounds', `Died of wounds after ${risk.cause}.`, choice.outcome, rng);
      return;
    }

    const treatmentRisk = treatmentDeathChance(state, severity);
    if (treatmentRisk > 0) {
      messages.push(`At the aid post, your chance of dying from the wound is ${Math.round(treatmentRisk * 1000) / 10}%.`);
      if (rng.next() < treatmentRisk) {
        messages.push('The aid post cannot stabilise the wound.');
        endGame(state, 'wounds', `Died of wounds after ${risk.cause}.`, choice.outcome, rng);
        return;
      }
      messages.push('Treatment stabilises the wound.');
    }

    const medicalBoardRisk = invalidedChance(state, severity);
    if (medicalBoardRisk > 0 && rng.next() < medicalBoardRisk) {
      messages.push('The medical board rules that you cannot return to front-line service.');
      endGame(state, 'invalided', `Invalided home after wounds sustained during ${risk.cause}.`, choice.outcome, rng);
      return;
    }
  }
  npcIncident(
    state,
    rng,
    choice.npcId,
    Math.min(0.22, (risk.npcDanger ?? 0) * riskModifier(state, choice).value),
    messages,
  );
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
      historyId: record.id,
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
  if (!returns) scheduleInterruptedStoryClosure(state, npc.id, 'transferred');
  messages.push(returns ? `${definition.name} returns to the section, thinner but walking.` : `${definition.name} will not return to the section after treatment.`);
}

function inActiveCampaign(date: string): boolean {
  const now = Date.parse(date);
  return HISTORY_TIMELINE.some((record) => record.campaign && record.end && Date.parse(record.at) <= now && now <= Date.parse(record.end));
}

function eventEligible(state: GameState, event: GameEvent): boolean {
  if (!requirementsMet(state, event.requirements)) return false;
  const memory = state.eventMemory?.[event.id];
  if (event.repeat?.maxOccurrences !== undefined && (memory?.count ?? 0) >= event.repeat.maxOccurrences) return false;
  if (event.repeat?.cooldownTurns !== undefined && memory && state.turn - memory.lastTurn < event.repeat.cooldownTurns) return false;
  if (event.scheduledOnly) {
    const due = state.scheduledEvents?.some((item) => item.eventId === event.id && item.dueTurn <= state.turn && item.expiresTurn >= state.turn);
    if (!due) return false;
  }
  if (event.kind === 'letter') {
    const id = event.id.replace('letter:', '');
    if (state.letters.some((letter) => letter.id === id)) return false;
  }
  if (event.focusNpcId && state.npcs.find((npc) => npc.id === event.focusNpcId)?.status !== 'active') return false;
  return availableChoices(state, event).length > 0;
}

function chooseFromCategory(state: GameState, events: GameEvent[], rng: RandomCursor): GameEvent | undefined {
  let candidates = events.filter((event) => eventEligible(state, event));
  const unseen = candidates.filter((event) => !state.eventMemory?.[event.id]);
  if (unseen.length > 0) candidates = unseen;
  const withoutRecent = candidates.filter((event) => !state.recentEventIds.includes(event.id));
  if (withoutRecent.length > 0) candidates = withoutRecent;
  if (candidates.length === 0) return undefined;
  return rng.weighted(candidates, (event) => event.weight);
}

export function selectNextEvent(state: GameState, rng: RandomCursor): GameEvent {
  if (!state.frontline && state.turn === 1 && state.eventMemory?.['arrival-at-front']
    && ['edward', 'george'].every((id) => state.npcs.find((npc) => npc.id === id)?.status === 'active')) {
    startFrontline(state);
  }
  if (state.frontline?.status === 'active') return eventById(`frontline-${state.frontline.stage}`);
  if (Date.parse(state.currentDate) >= Date.parse(FINAL_HOUR)) return eventById('last-morning-fire');
  const pending = state.pendingHistoryIds[0];
  if (pending) return eventById(`history:${pending}`);

  const scheduled = (state.scheduledEvents ?? [])
    .filter((item) => item.dueTurn <= state.turn && item.expiresTurn >= state.turn)
    .sort((a, b) => a.dueTurn - b.dueTurn)
    .map((item) => eventById(item.eventId))
    .find((event) => eventEligible(state, event));
  if (scheduled) return scheduled;

  const eligible = PLAY_EVENTS.filter((event) => eventEligible(state, event));
  const combat = eligible.filter((event) => event.kind === 'combat');
  const relationships = eligible.filter((event) => event.kind === 'relationship');
  const letters = eligible.filter((event) => event.kind === 'letter');
  const routine = eligible.filter((event) => !['combat', 'relationship', 'letter'].includes(event.kind));

  const activeCampaign = inActiveCampaign(state.currentDate);
  const roll = rng.next();
  let selected: GameEvent | undefined;
  const combatChance = activeCampaign ? 0.5 : 0.11;
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
  ensureNarrativeState(state);
  if (state.frontline?.status !== 'active') ensureInterruptedStoryClosures(state);
  const event = getCurrentEvent(state);
  const isFrontline = isFrontlineEvent(event.id) && state.frontline?.status === 'active';
  const choice = availableChoices(state, event).find((candidate) => candidate.id === choiceId);
  if (!choice) throw new Error(`Choice ${choiceId} is unavailable for event ${event.id}`);

  const rng = new RandomCursor(state.rngState);
  const previousDate = state.currentDate;
  const messages = [choice.outcome];
  state.scheduledEvents = state.scheduledEvents.filter((item) => item.eventId !== event.id && item.expiresTurn >= state.turn);
  applyEffects(state, choice.effects);
  recordLetter(state, event, choice);

  if (event.kind === 'historical' && event.historyId) {
    state.pendingHistoryIds = state.pendingHistoryIds.filter((id) => id !== event.historyId);
  }

  const isFinalHourEvent = event.id === 'last-morning-fire';
  state.currentDate = isFinalHourEvent
    ? '1918-11-11T10:58:00.000Z'
    : isFrontline ? advanceByAmount(state.currentDate, choice.advance, choice.advance.min)
      : advanceGameTime(state.currentDate, choice.advance, rng);
  if (!isFrontline) applyTimePressure(state, previousDate, state.currentDate, event);
  const resolvedRisk = calculateExposure(state, choice);
  const frontlineNotices = isFrontline ? resolveFrontlineAction(state, choice, previousDate) : undefined;
  if (frontlineNotices) {
    messages.push(...frontlineNotices.map((notice) => FRONTLINE_NOTICE_TEXT[notice].en));
    if (frontlineNotices.includes('playerDied')) {
      messages[0] = 'You could not complete the action before your bleeding became fatal.';
      endGame(state, 'wounds', FRONTLINE_NOTICE_TEXT.playerDied.en, choice.outcome, rng);
    }
  } else resolveRisk(state, choice, rng, messages);
  if (isFinalHourEvent && state.status === 'playing') state.currentDate = ARMISTICE_DATE;
  if (!isFrontline && state.status === 'playing') maybeRecoverNpc(state, rng, messages);
  triggerHistory(state, previousDate, state.currentDate);

  state.turn += 1;
  const previousMemory = state.eventMemory[event.id];
  state.eventMemory[event.id] = {
    count: (previousMemory?.count ?? 0) + 1,
    lastTurn: state.turn,
    lastChoiceId: choice.id,
  };
  state.journal.push({
    id: `turn-${state.turn}`,
    date: previousDate,
    title: event.title,
    body: messages.join(' '),
    category: event.kind,
    eventId: event.id,
    choiceId: choice.id,
    frontlineNotices,
    riskAssessment: resolvedRisk ? {
      exposurePercent: Math.round(resolvedRisk.exposure * 1000) / 10,
      factors: resolvedRisk.factors,
    } : undefined,
  });
  state.lastResolution = messages;
  state.recentEventIds = [event.id, ...state.recentEventIds.filter((id) => id !== event.id)].slice(0, 7);
  if (!isFrontline) state.weather = rng.pick(WEATHER);

  if (!isFrontline || state.frontline?.status === 'completed') normaliseAfterTurn(state, rng, choice.outcome);
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

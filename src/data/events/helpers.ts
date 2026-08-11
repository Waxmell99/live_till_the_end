import type {
  ChoiceEffects,
  ChoiceRisk,
  EventChoice,
  EventKind,
  EventRequirements,
  EventRepeat,
  GameEvent,
  TimeAdvance,
} from '../../game/types';

export interface ChoiceSeed {
  label: string;
  detail: string;
  posture: EventChoice['posture'];
  effects?: ChoiceEffects;
  risk?: ChoiceRisk;
  advance?: TimeAdvance;
  outcome: string;
  requirements?: EventRequirements;
}

export function makeChoice(id: string, seed: ChoiceSeed, fallbackAdvance: TimeAdvance): EventChoice {
  return {
    id,
    label: seed.label,
    detail: seed.detail,
    posture: seed.posture,
    effects: seed.effects,
    risk: seed.risk,
    advance: seed.advance ?? fallbackAdvance,
    outcome: seed.outcome,
    requirements: seed.requirements,
  };
}

export function makeEvent(seed: {
  id: string;
  kind?: EventKind;
  title: string;
  kicker: string;
  text: string;
  choices: ChoiceSeed[];
  advance?: TimeAdvance;
  weight?: number;
  requirements?: EventRequirements;
  tags?: string[];
  focusNpcId?: string;
  repeat?: EventRepeat;
  arcId?: string;
  arcStage?: number;
  scheduledOnly?: boolean;
}): GameEvent {
  const kind = seed.kind ?? 'routine';
  const advance = seed.advance ?? { min: 4, max: 9, unit: 'days' };
  return {
    id: seed.id,
    kind,
    title: seed.title,
    kicker: seed.kicker,
    text: [seed.text],
    source: 'fictional',
    weight: seed.weight ?? 1,
    requirements: seed.requirements,
    choices: seed.choices.map((choice, index) => makeChoice(String.fromCharCode(97 + index), choice, advance)),
    tags: seed.tags,
    focusNpcId: seed.focusNpcId,
    repeat: seed.repeat ?? (kind === 'combat' ? { maxOccurrences: 2, cooldownTurns: 18 } : { maxOccurrences: 1 }),
    arcId: seed.arcId,
    arcStage: seed.arcStage,
    scheduledOnly: seed.scheduledOnly,
  };
}

export const quietAdvance: TimeAdvance = { min: 7, max: 14, unit: 'days' };
export const shortAdvance: TimeAdvance = { min: 1, max: 4, unit: 'days' };
export const dangerAdvance: TimeAdvance = { min: 1, max: 7, unit: 'hours' };

export function statChoice(
  label: string,
  detail: string,
  posture: EventChoice['posture'],
  stats: ChoiceEffects['stats'],
  outcome: string,
  extras: Partial<ChoiceSeed> = {},
): ChoiceSeed {
  return { label, detail, posture, effects: { stats, ...extras.effects }, outcome, ...extras };
}

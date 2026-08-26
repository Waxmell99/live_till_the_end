export type StatKey = 'health' | 'morale' | 'stress' | 'hunger' | 'fatigue';

export interface Stats {
  health: number;
  morale: number;
  stress: number;
  hunger: number;
  fatigue: number;
}

export interface CharacterProfile {
  name: string;
  age: number;
  nationality: 'British';
  occupation: string;
  hometown: string;
  family: string;
  enlisted: string;
  birthYear: number;
}

export type NpcStatus = 'active' | 'wounded' | 'dead' | 'transferred' | 'captured';

export interface NpcDefinition {
  id: string;
  name: string;
  age: number;
  role: string;
  hometown: string;
  background: string;
  temperament: string;
  keepsake: string;
  initials: string;
}

export interface NpcState {
  id: string;
  relationship: number;
  status: NpcStatus;
  statusDate?: string;
  epitaph?: string;
}

export type EventKind = 'routine' | 'combat' | 'relationship' | 'survival' | 'letter' | 'historical';

export interface EventRequirements {
  from?: string;
  until?: string;
  minStats?: Partial<Stats>;
  maxStats?: Partial<Stats>;
  flagsAll?: string[];
  flagsAny?: string[];
  flagsNone?: string[];
  itemsAll?: string[];
  npcActive?: string;
  npcStatuses?: Record<string, NpcStatus | NpcStatus[]>;
  historyTriggered?: string;
  minRelationships?: Record<string, number>;
  maxRelationships?: Record<string, number>;
  arcStages?: Record<string, number>;
}

export interface TimeAdvance {
  min: number;
  max: number;
  unit: 'minutes' | 'hours' | 'days';
}

export interface ChoiceEffects {
  stats?: Partial<Stats>;
  relationships?: Record<string, number>;
  addItems?: string[];
  removeItems?: string[];
  addFlags?: string[];
  removeFlags?: string[];
  receiveLetter?: string;
  setArcStages?: Record<string, number>;
  setNpcStatuses?: Record<string, NpcStatus>;
  scheduleEvents?: Array<{
    eventId: string;
    afterTurns: number;
    expiresAfterTurns?: number;
  }>;
}

export interface EventRepeat {
  maxOccurrences?: number;
  cooldownTurns?: number;
}

export interface ChoiceRisk {
  /** Probability that something happens before contextual modifiers. */
  danger: number;
  fatality?: number;
  capture?: number;
  npcDanger?: number;
  healthLoss?: [number, number];
  cause: string;
  mitigationItem?: string;
}

export interface EventChoice {
  id: string;
  label: string;
  detail: string;
  posture: 'bold' | 'careful' | 'social' | 'rest' | 'duty';
  requirements?: EventRequirements;
  effects?: ChoiceEffects;
  risk?: ChoiceRisk;
  advance: TimeAdvance;
  outcome: string;
  /** Which NPC this choice is about — used to substitute with a random alive comrade if the original is dead. */
  npcId?: string;
}

export interface GameEvent {
  id: string;
  kind: EventKind;
  title: string;
  kicker: string;
  text: string[];
  source: 'fictional' | 'historical';
  weight: number;
  requirements?: EventRequirements;
  choices: EventChoice[];
  tags?: string[];
  focusNpcId?: string;
  historyId?: string;
  repeat?: EventRepeat;
  arcId?: string;
  arcStage?: number;
  scheduledOnly?: boolean;
  recap?: string;
  nextHint?: string;
}

export interface HistoricalRecord {
  id: string;
  at: string;
  end?: string;
  title: string;
  shortTitle: string;
  location?: string;
  summary: string;
  archive: string;
  effects?: Partial<Stats>;
  campaign?: string;
}

export interface LetterDefinition {
  id: string;
  from: string;
  subject: string;
  body: string[];
  replyOptions: Array<{
    id: string;
    label: string;
    tone: string;
    effects: Partial<Stats>;
  }>;
}

export interface LetterState {
  id: string;
  receivedAt: string;
  saved: boolean;
  repliedWith?: string;
}

export interface EventMemoryEntry {
  count: number;
  lastTurn: number;
  lastChoiceId: string;
}

export interface ScheduledEvent {
  eventId: string;
  dueTurn: number;
  expiresTurn: number;
}

export type RiskFactorKey =
  | 'lowHealth'
  | 'highFatigue'
  | 'highStress'
  | 'lowMorale'
  | 'battlefieldChance'
  | 'carefulPosture'
  | 'boldPosture'
  | 'restPosture'
  | 'badWeather'
  | 'protectiveEquipment'
  | 'fieldDressing'
  | 'alfieAid';

export interface RiskFactor {
  key: RiskFactorKey;
  direction: 'raises' | 'lowers';
  percent: number;
}

export interface RiskAssessmentSnapshot {
  exposurePercent: number;
  factors: RiskFactor[];
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
  category: EventKind | 'personnel' | 'ending';
  eventId?: string;
  choiceId?: string;
  historyId?: string;
  npcId?: string;
  endingType?: EndingType;
  riskAssessment?: RiskAssessmentSnapshot;
}

export type EndingType = 'killed' | 'wounds' | 'invalided' | 'pow' | 'survived';

export interface Ending {
  type: EndingType;
  date: string;
  cause: string;
  finalEvent: string;
  postwar?: string[];
}

export type GameStatus = 'playing' | 'ended';

export interface GameState {
  version: 1;
  seed: number;
  rngState: number;
  status: GameStatus;
  turn: number;
  startedAt: string;
  currentDate: string;
  character: CharacterProfile;
  stats: Stats;
  location: string;
  weather: string;
  currentEventId: string;
  recentEventIds: string[];
  pendingHistoryIds: string[];
  triggeredHistoryIds: string[];
  campaigns: string[];
  npcs: NpcState[];
  inventory: string[];
  flags: string[];
  eventMemory: Record<string, EventMemoryEntry>;
  storyArcs: Record<string, number>;
  scheduledEvents: ScheduledEvent[];
  letters: LetterState[];
  journal: JournalEntry[];
  lastResolution: string[];
  ending?: Ending;
  updatedAt: string;
}

export interface CharacterInput {
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  family: string;
  enlisted: string;
}

export interface SimulationSummary {
  runs: number;
  survived: number;
  killed: number;
  wounds: number;
  invalided: number;
  pow: number;
  stalled: number;
  averageTurns: number;
  averageDays: number;
  survivorAverageTurns: number;
  survivorRepeatRate: number;
  survivorAverageCompletedArcs: number;
  survivorAverageChapterEvents: number;
}

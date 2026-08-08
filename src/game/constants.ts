import type { Stats } from './types';

export const GAME_VERSION = 1 as const;
export const START_DATE = '1917-02-12T07:00:00.000Z';
export const ARMISTICE_DATE = '1918-11-11T11:00:00.000Z';
export const SAVE_KEY = 'survive-until-war-ends.save.v1';

export const INITIAL_STATS: Stats = {
  health: 92,
  morale: 58,
  stress: 28,
  hunger: 24,
  fatigue: 34,
};

export const WEATHER = [
  'Low cloud and drizzle',
  'Cold, steady rain',
  'A pale, dry morning',
  'Hard wind from the west',
  'Mist lying over the wire',
  'Sleet against the duckboards',
  'Heavy, airless heat',
  'Clear sky above the guns',
];

export const ITEM_LABELS: Record<string, string> = {
  gas_mask: 'Small box respirator',
  dry_socks: 'Dry socks',
  field_dressing: 'Field dressing',
  extra_ration: 'Saved ration',
  lucky_coin: 'Lucky coin',
  family_photo: 'Family photograph',
  clean_water: 'Clean water',
};

export const EVENT_KIND_LABELS = {
  routine: 'Trench routine',
  combat: 'Under fire',
  relationship: 'Company life',
  survival: 'Conditions',
  letter: 'Mail call',
  historical: 'Historical record',
} as const;

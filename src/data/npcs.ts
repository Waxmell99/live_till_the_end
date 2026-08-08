import type { NpcDefinition, NpcState } from '../game/types';

export const NPC_DEFINITIONS: NpcDefinition[] = [
  {
    id: 'james',
    name: 'James Wilson',
    age: 21,
    role: 'Rifleman',
    hometown: 'Limehouse, London',
    background: 'A dock labourer who enlisted with two cousins. He can turn almost any misery into a joke.',
    temperament: 'Outgoing, impulsive, generous',
    keepsake: 'A bent brass tram token',
    initials: 'JW',
  },
  {
    id: 'arthur',
    name: 'Arthur Hale',
    age: 34,
    role: 'Lance corporal',
    hometown: 'Bath, Somerset',
    background: 'A schoolteacher, married to Beatrice, with two daughters who write in coloured pencil.',
    temperament: 'Patient, observant, quietly stubborn',
    keepsake: 'His daughters’ folded drawing',
    initials: 'AH',
  },
  {
    id: 'edward',
    name: 'Edward Finch',
    age: 18,
    role: 'Rifleman',
    hometown: 'Norwich, Norfolk',
    background: 'A printer’s apprentice who arrived in France only days before you met him.',
    temperament: 'Earnest, anxious, eager to be useful',
    keepsake: 'A spotless pocket watch',
    initials: 'EF',
  },
  {
    id: 'george',
    name: 'George Bennett',
    age: 27,
    role: 'Lewis gunner',
    hometown: 'Barnsley, Yorkshire',
    background: 'A coal miner with a dry voice, broad hands, and little patience for boasting.',
    temperament: 'Reserved, practical, loyal',
    keepsake: 'A small piece of coal wrapped in cloth',
    initials: 'GB',
  },
  {
    id: 'alfie',
    name: 'Alfred “Alfie” Clarke',
    age: 23,
    role: 'Stretcher-bearer',
    hometown: 'Birmingham, Warwickshire',
    background: 'A baker before the war. He volunteered for stretcher duty after his younger brother was wounded.',
    temperament: 'Warm, candid, brave without display',
    keepsake: 'A flour-stained recipe card',
    initials: 'AC',
  },
];

export function createNpcStates(): NpcState[] {
  return NPC_DEFINITIONS.map((npc) => ({
    id: npc.id,
    relationship: 38,
    status: 'active',
  }));
}

export function getNpc(id: string): NpcDefinition {
  const npc = NPC_DEFINITIONS.find((candidate) => candidate.id === id);
  if (!npc) throw new Error(`Unknown NPC: ${id}`);
  return npc;
}

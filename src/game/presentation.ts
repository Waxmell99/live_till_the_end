import { getNpc } from '../data/npcs';
import type { GameState, NpcStatus } from './types';

export function formatDate(iso: string, includeTime = false): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  if (!includeTime) return formatted;
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
  return `${formatted} · ${time}`;
}

export function renderNarrative(text: string, state: GameState): string {
  const [firstName] = state.character.name.split(/\s+/);
  return text
    .replaceAll('{name}', state.character.name)
    .replaceAll('{firstName}', firstName)
    .replace(/\{npc:([^}]+)\}/g, (_match, id: string) => getNpc(id).name);
}

export function statusLabel(status: NpcStatus): string {
  return {
    active: 'With the section',
    wounded: 'Wounded',
    dead: 'Killed',
    transferred: 'Transferred',
    captured: 'Missing / captured',
  }[status];
}

export function relationshipLabel(value: number): string {
  if (value >= 80) return 'Like family';
  if (value >= 62) return 'Trusted friend';
  if (value >= 45) return 'Comrade';
  if (value >= 25) return 'Distant';
  return 'Strained';
}

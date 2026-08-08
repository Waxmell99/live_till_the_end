import { getNpc } from '../data/npcs';
import type { GameState, NpcStatus } from './types';
import type { Language } from '../i18n';

export function formatDate(iso: string, includeTime = false, language: Language = 'en'): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  if (!includeTime) return formatted;
  const time = new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
  return language === 'zh' ? `${formatted} ${time}` : `${formatted} · ${time}`;
}

export function renderNarrative(text: string, state: GameState): string {
  const [firstName] = state.character.name.split(/\s+/);
  return text
    .replaceAll('{name}', state.character.name)
    .replaceAll('{firstName}', firstName)
    .replace(/\{npc:([^}]+)\}/g, (_match, id: string) => getNpc(id).name);
}

export function statusLabel(status: NpcStatus, language: Language = 'en'): string {
  const labels = language === 'zh' ? {
    active: '仍在班组',
    wounded: '负伤',
    dead: '阵亡',
    transferred: '调离',
    captured: '失踪／被俘',
  } : {
    active: 'With the section',
    wounded: 'Wounded',
    dead: 'Killed',
    transferred: 'Transferred',
    captured: 'Missing / captured',
  };
  return labels[status];
}

export function relationshipLabel(value: number, language: Language = 'en'): string {
  if (language === 'zh') {
    if (value >= 80) return '亲如家人';
    if (value >= 62) return '可信赖的朋友';
    if (value >= 45) return '战友';
    if (value >= 25) return '疏远';
    return '关系紧张';
  }
  if (value >= 80) return 'Like family';
  if (value >= 62) return 'Trusted friend';
  if (value >= 45) return 'Comrade';
  if (value >= 25) return 'Distant';
  return 'Strained';
}

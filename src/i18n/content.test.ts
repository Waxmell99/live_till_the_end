import { describe, expect, it } from 'vitest';
import { ALL_EVENTS } from '../data/events';
import { HISTORY_TIMELINE } from '../data/history';
import { LETTERS } from '../data/letters';
import { NPC_DEFINITIONS } from '../data/npcs';
import { createNewGame, resolveChoice } from '../game/engine';
import {
  localizeEndingCause,
  localizeDynamicText,
  localizeEvent,
  localizeHistory,
  localizeJournalEntry,
  localizeLetter,
  localizeNpc,
  untranslatedEventIds,
  ZH_EVENTS,
} from './content';

const profile = {
  name: 'Thomas Miller',
  age: 19,
  occupation: 'Railway apprentice',
  hometown: 'Manchester',
  family: 'Parents and a younger sister at home',
  enlisted: 'September 1916',
};

describe('Chinese content pack', () => {
  it('covers every playable, letter, and historical event', () => {
    expect(untranslatedEventIds()).toEqual([]);
    expect(Object.keys(ZH_EVENTS)).toHaveLength(ALL_EVENTS.length);
    for (const event of ALL_EVENTS) {
      expect(ZH_EVENTS[event.id].choices).toHaveLength(event.choices.length);
      expect(ZH_EVENTS[event.id].text.length).toBeGreaterThan(0);
    }
  });

  it('changes presentation without mutating the source event', () => {
    const source = ALL_EVENTS.find((event) => event.id === 'arrival-at-front')!;
    const localized = localizeEvent(source, 'zh');
    expect(localized.title).toBe('道路在战壕前终止');
    expect(localized.choices[1].label).toContain('战友');
    expect(source.title).toBe('The road ends at the trenches');
  });

  it('covers every letter, comrade, historical record, and risk cause', () => {
    for (const letter of LETTERS) {
      const localized = localizeLetter(letter, 'zh');
      expect(localized.subject).not.toBe(letter.subject);
      expect(localized.body).not.toEqual(letter.body);
      expect(localized.replyOptions).toHaveLength(letter.replyOptions.length);
    }
    for (const npc of NPC_DEFINITIONS) {
      const localized = localizeNpc(npc, 'zh');
      expect(localized.role).not.toBe(npc.role);
      expect(localized.background).not.toBe(npc.background);
    }
    for (const record of HISTORY_TIMELINE) {
      const localized = localizeHistory(record, 'zh');
      expect(localized.title).not.toBe(record.title);
      expect(localized.archive).not.toBe(record.archive);
    }
    for (const event of ALL_EVENTS) {
      for (const choice of event.choices) {
        if (!choice.risk) continue;
        const localized = localizeEndingCause(`Killed by ${choice.risk.cause}.`, 'zh');
        expect(localized).not.toContain(choice.risk.cause);
      }
    }
  });

  it('localizes diary outcomes while leaving deterministic state in English', () => {
    const initial = createNewGame(profile, 19171111);
    const state = resolveChoice(initial, 'b');
    const sourceEntry = state.journal[state.journal.length - 1];
    const localized = localizeJournalEntry(sourceEntry, state, 'zh');
    expect(sourceEntry.body).toContain('Five men make room');
    expect(localized.body).toContain('五个人在冒烟的火盆旁');
    expect(localized.title).toBe('道路在战壕前终止');

    const legacyEntry = { ...sourceEntry, eventId: undefined, choiceId: undefined };
    const localizedLegacy = localizeJournalEntry(legacyEntry, state, 'zh');
    expect(localizedLegacy.body).toContain('五个人在冒烟的火盆旁');
    const legacyInitial = { ...state.journal[0], eventId: undefined };
    expect(localizeJournalEntry(legacyInitial, state, 'zh').title).toBe('派往西线');
  });

  it('localizes the layered wound and treatment explanation', () => {
    const source = 'You suffer a critical wound (37 health lost). Your field dressing slows the bleeding before evacuation. At the aid post, your chance of dying from the wound is 18.5%. Treatment stabilises the wound.';
    const localized = localizeDynamicText(source, 'zh');
    expect(localized).toContain('重伤');
    expect(localized).toContain('急救包扎带');
    expect(localized).toContain('18.5%');
    expect(localized).toContain('伤势稳定');
  });
});

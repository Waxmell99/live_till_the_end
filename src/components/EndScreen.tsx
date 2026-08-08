import { useState } from 'react';
import { getNpc } from '../data/npcs';
import { daysSurvived } from '../game/engine';
import { formatDate, statusLabel } from '../game/presentation';
import type { GameState } from '../game/types';
import { useLanguage, type TranslationKey } from '../i18n';
import { localizeEndingCause, localizeJournalEntry, localizeLocation, localizePostwarLine, localizeProfileValue } from '../i18n/content';
import { LanguageSwitcher } from './LanguageSwitcher';

interface EndScreenProps {
  state: GameState;
  onAnotherLife: () => void;
}

export function EndScreen({ state, onAnotherLife }: EndScreenProps) {
  const { language, t } = useLanguage();
  const [showDiary, setShowDiary] = useState(false);
  const ending = state.ending!;
  const lived = ending.type === 'survived' || ending.type === 'invalided' || ending.type === 'pow';
  const endYear = new Date(ending.date).getUTCFullYear();
  const laterYear = Math.max(state.character.birthYear + 58, 1956 + (state.seed % 33));
  const recordEndYear = lived ? laterYear : endYear;
  const age = endYear - state.character.birthYear;

  return (
    <main className={`end-screen ending-${ending.type} lang-${language}`}>
      <div className="end-grain" aria-hidden="true" />
      <div className="end-language"><LanguageSwitcher compact /></div>
      {ending.type === 'survived' && (
        <div className="armistice-sequence" aria-label={t('ending.silentAria')}>
          <span className="clock clock-one">10:58</span>
          <span className="clock clock-two">10:59</span>
          <span className="clock clock-three">11:00</span>
          <p>{t('ending.silent')}</p>
        </div>
      )}
      <section className="end-record">
        <p className="end-classification">{t(`ending.${ending.type}` as TranslationKey)}</p>
        <h1>{state.character.name}</h1>
        <p className="life-years">{state.character.birthYear} — {recordEndYear}</p>
        {!lived && <p className="age-line">{t('ending.age', { age })}</p>}
        <div className="end-cause"><p>{localizeEndingCause(ending.cause, language)}</p><time>{formatDate(ending.date, true, language)} · {localizeLocation(state.location, language)}</time></div>
        {ending.postwar && <div className="postwar-record">{ending.postwar.map((line) => <p key={line}>{localizePostwarLine(line, language)}</p>)}</div>}
        <div className="survival-mark">
          <span>{daysSurvived(state)}</span>
          <p>{t('ending.days')}</p>
        </div>
        <p className="final-statement">{lived ? t('ending.survivedWar') : t('ending.endedHere')}</p>
        <div className="end-actions">
          <button className="button button-ghost" type="button" onClick={() => setShowDiary((value) => !value)}>{showDiary ? t('ending.closeDiary') : t('ending.viewDiary')}</button>
          <button className="button button-primary" type="button" onClick={onAnotherLife}>{t('ending.another')}</button>
        </div>
      </section>

      {showDiary && (
        <section className="end-diary">
          <header><div><p className="eyebrow">{t('ending.completeRecord')}</p><h2>{t('ending.diary')}</h2></div><button type="button" aria-label={t('ending.closeDiary')} onClick={() => setShowDiary(false)}>×</button></header>
          <div className="end-summary">
            <div><span>{t('ending.campaigns')}</span><p>{state.campaigns.map((campaign) => localizeProfileValue(campaign, language)).join(' · ') || t('history.routine')}</p></div>
            <div><span>{t('ending.comrades')}</span><p>{state.npcs.map((npc) => `${getNpc(npc.id).name}: ${statusLabel(npc.status, language)}`).join(' · ')}</p></div>
          </div>
          <div className="end-diary-entries">
            {[...state.journal].reverse().map((sourceEntry) => {
              const entry = localizeJournalEntry(sourceEntry, state, language);
              return <article key={entry.id}><time>{formatDate(entry.date, false, language)}</time><h3>{entry.title}</h3><p>{entry.body}</p></article>;
            })}
          </div>
        </section>
      )}
    </main>
  );
}

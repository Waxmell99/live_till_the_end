import { useEffect, useState } from 'react';
import { letterById } from '../data/letters';
import { NPC_DEFINITIONS } from '../data/npcs';
import { discoveredHistory } from '../game/engine';
import { formatDate, relationshipLabel, renderNarrative, statusLabel } from '../game/presentation';
import type { GameState } from '../game/types';
import { useLanguage, type TranslationKey } from '../i18n';
import { localizeHistory, localizeJournalEntry, localizeLetter, localizeNpc, localizeNpcEpitaph } from '../i18n/content';

export type DossierTab = 'diary' | 'archive' | 'letters' | 'personnel';

interface DossierProps {
  state: GameState;
  initialTab: DossierTab;
  onClose: () => void;
  onToggleLetter: (letterId: string) => void;
}

const TABS: DossierTab[] = ['diary', 'archive', 'letters', 'personnel'];
const TAB_KEYS: Record<DossierTab, TranslationKey> = {
  diary: 'dossier.diary',
  archive: 'dossier.archive',
  letters: 'dossier.letters',
  personnel: 'dossier.personnel',
};

export function Dossier({ state, initialTab, onClose, onToggleLetter }: DossierProps) {
  const { language, t } = useLanguage();
  const [tab, setTab] = useState<DossierTab>(initialTab);
  const history = discoveredHistory(state).map((record) => localizeHistory(record, language));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="dossier-overlay" role="dialog" aria-modal="true" aria-label={t('dossier.aria')}>
      <button className="dossier-scrim" type="button" onClick={onClose} aria-label={t('dossier.close')} />
      <section className="dossier">
        <header className="dossier-header">
          <div>
            <p className="eyebrow">{t('dossier.eyebrow')}</p>
            <h2>{state.character.name}</h2>
          </div>
          <button className="dossier-close" type="button" onClick={onClose} aria-label={t('dossier.close')}>×</button>
        </header>
        <nav className="dossier-tabs" aria-label={t('dossier.sections')}>
          {TABS.map((item) => (
            <button className={tab === item ? 'active' : ''} type="button" key={item} onClick={() => setTab(item)}>{t(TAB_KEYS[item])}</button>
          ))}
        </nav>
        <div className="dossier-content">
          {tab === 'diary' && (
            <section className="diary-view">
              <div className="section-title"><span>{t('diary.title')}</span><small>{t('diary.latest', { count: state.journal.length })}</small></div>
              <div className="diary-entries">
                {[...state.journal].reverse().map((sourceEntry) => {
                  const entry = localizeJournalEntry(sourceEntry, state, language);
                  return (
                  <article className={`diary-entry diary-${entry.category}`} key={entry.id}>
                    <time>{formatDate(entry.date, true, language)}</time>
                    <h3>{entry.title}</h3>
                    <p>{entry.body}</p>
                  </article>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'archive' && (
            <section className="archive-view">
              <div className="section-title"><span>{t('archive.title')}</span><small>{t('archive.known')}</small></div>
              <p className="archive-principle">{t('archive.principle')}</p>
              <div className="timeline-list">
                {history.map((record) => (
                  <article className="timeline-entry" key={record.id}>
                    <div className="timeline-date"><span>{new Date(record.at).getUTCFullYear()}</span><b>{formatDate(record.at, false, language).replace(language === 'zh' ? /^\d{4}年/ : / \d{4}$/, '')}</b></div>
                    <div><p className="fact-label">{t('archive.fact')}</p><h3>{record.title}</h3><p>{record.archive}</p>{record.end && <small>{formatDate(record.at, false, language)} — {formatDate(record.end, false, language)}</small>}</div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === 'letters' && (
            <section className="letters-view">
              <div className="section-title"><span>{t('letters.title')}</span><small>{t('record.received', { count: state.letters.length })}</small></div>
              {state.letters.length === 0 ? (
                <div className="empty-file"><p>{t('letters.none')}</p><small>{t('letters.noneHelp')}</small></div>
              ) : (
                <div className="letter-stack">
                  {[...state.letters].reverse().map((letterState) => {
                    const letter = localizeLetter(letterById(letterState.id), language);
                    const reply = letter.replyOptions.find((option) => option.id === letterState.repliedWith);
                    return (
                      <article className={`letter-sheet ${letterState.saved ? 'letter-saved' : ''}`} key={letter.id}>
                        <header><span>{t('letters.from', { name: letter.from })}</span><time>{formatDate(letterState.receivedAt, false, language)}</time></header>
                        <h3>{letter.subject}</h3>
                        {letter.body.map((line, index) => <p key={index}>{renderNarrative(line, state)}</p>)}
                        {reply && <blockquote><span>{t('letters.reply')}</span>{reply.tone}</blockquote>}
                        {letterState.saved && <span className="kept-stamp">{t('letters.kept')}</span>}
                        <button type="button" onClick={() => onToggleLetter(letter.id)}>{letterState.saved ? t('letters.remove') : t('letters.keep')}</button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'personnel' && (
            <section className="personnel-view">
              <div className="section-title"><span>{t('personnel.title')}</span><small>{t('personnel.fictional')}</small></div>
              <div className="personnel-grid">
                {NPC_DEFINITIONS.map((sourceNpc) => {
                  const npc = localizeNpc(sourceNpc, language);
                  const npcState = state.npcs.find((candidate) => candidate.id === npc.id)!;
                  return (
                    <article className={`personnel-file npc-${npcState.status}`} key={npc.id}>
                      <div className="personnel-photo"><span>{npc.initials}</span><small>{t('personnel.noPhoto').split('\n').map((line) => <span key={line}>{line}<br /></span>)}</small></div>
                      <div className="personnel-copy">
                        <p className="fact-label">{t('personnel.age', { role: npc.role, age: npc.age })}</p>
                        <h3>{npc.name}</h3>
                        <p>{npc.background}</p>
                        <dl><div><dt>{t('personnel.home')}</dt><dd>{npc.hometown}</dd></div><div><dt>{t('personnel.temperament')}</dt><dd>{npc.temperament}</dd></div><div><dt>{t('personnel.keepsake')}</dt><dd>{npc.keepsake}</dd></div></dl>
                        <footer><b>{statusLabel(npcState.status, language)}</b><span>{relationshipLabel(npcState.relationship, language)}</span></footer>
                        {npcState.epitaph && <p className="personnel-epitaph">{localizeNpcEpitaph(npcState.epitaph, language)}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}

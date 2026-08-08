import { useEffect, useState } from 'react';
import { letterById } from '../data/letters';
import { NPC_DEFINITIONS } from '../data/npcs';
import { discoveredHistory } from '../game/engine';
import { formatDate, relationshipLabel, renderNarrative, statusLabel } from '../game/presentation';
import type { GameState } from '../game/types';

export type DossierTab = 'diary' | 'archive' | 'letters' | 'personnel';

interface DossierProps {
  state: GameState;
  initialTab: DossierTab;
  onClose: () => void;
  onToggleLetter: (letterId: string) => void;
}

const TABS: Array<{ id: DossierTab; label: string }> = [
  { id: 'diary', label: 'War diary' },
  { id: 'archive', label: 'Archive' },
  { id: 'letters', label: 'Letters' },
  { id: 'personnel', label: 'Personnel' },
];

export function Dossier({ state, initialTab, onClose, onToggleLetter }: DossierProps) {
  const [tab, setTab] = useState<DossierTab>(initialTab);
  const history = discoveredHistory(state);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="dossier-overlay" role="dialog" aria-modal="true" aria-label="Field dossier">
      <button className="dossier-scrim" type="button" onClick={onClose} aria-label="Close dossier" />
      <section className="dossier">
        <header className="dossier-header">
          <div>
            <p className="eyebrow">British Expeditionary Force · private papers</p>
            <h2>{state.character.name}</h2>
          </div>
          <button className="dossier-close" type="button" onClick={onClose} aria-label="Close">×</button>
        </header>
        <nav className="dossier-tabs" aria-label="Dossier sections">
          {TABS.map((item) => (
            <button className={tab === item.id ? 'active' : ''} type="button" key={item.id} onClick={() => setTab(item.id)}>{item.label}</button>
          ))}
        </nav>
        <div className="dossier-content">
          {tab === 'diary' && (
            <section className="diary-view">
              <div className="section-title"><span>WAR DIARY</span><small>{state.journal.length} entries · latest first</small></div>
              <div className="diary-entries">
                {[...state.journal].reverse().map((entry) => (
                  <article className={`diary-entry diary-${entry.category}`} key={entry.id}>
                    <time>{formatDate(entry.date, true)}</time>
                    <h3>{entry.title}</h3>
                    <p>{entry.body}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === 'archive' && (
            <section className="archive-view">
              <div className="section-title"><span>HISTORICAL ARCHIVE</span><small>Facts known by this date</small></div>
              <p className="archive-principle">These entries describe recorded history. Personal scenes and comrades are fictional, and cannot alter this timeline.</p>
              <div className="timeline-list">
                {history.map((record) => (
                  <article className="timeline-entry" key={record.id}>
                    <div className="timeline-date"><span>{new Date(record.at).getUTCFullYear()}</span><b>{formatDate(record.at).replace(/ \d{4}$/, '')}</b></div>
                    <div><p className="fact-label">Historical fact</p><h3>{record.title}</h3><p>{record.archive}</p>{record.end && <small>{formatDate(record.at)} — {formatDate(record.end)}</small>}</div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === 'letters' && (
            <section className="letters-view">
              <div className="section-title"><span>LETTERS FROM HOME</span><small>{state.letters.length} received</small></div>
              {state.letters.length === 0 ? (
                <div className="empty-file"><p>No letters have reached you yet.</p><small>Mail arrives irregularly. Time at the front does not.</small></div>
              ) : (
                <div className="letter-stack">
                  {[...state.letters].reverse().map((letterState) => {
                    const letter = letterById(letterState.id);
                    const reply = letter.replyOptions.find((option) => option.id === letterState.repliedWith);
                    return (
                      <article className={`letter-sheet ${letterState.saved ? 'letter-saved' : ''}`} key={letter.id}>
                        <header><span>From {letter.from}</span><time>{formatDate(letterState.receivedAt)}</time></header>
                        <h3>{letter.subject}</h3>
                        {letter.body.map((line, index) => <p key={index}>{renderNarrative(line, state)}</p>)}
                        {reply && <blockquote><span>Your reply</span>{reply.tone}</blockquote>}
                        <button type="button" onClick={() => onToggleLetter(letter.id)}>{letterState.saved ? 'Remove from kept letters' : 'Keep this letter'}</button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'personnel' && (
            <section className="personnel-view">
              <div className="section-title"><span>SECTION ROLL</span><small>Fictional people</small></div>
              <div className="personnel-grid">
                {NPC_DEFINITIONS.map((npc) => {
                  const npcState = state.npcs.find((candidate) => candidate.id === npc.id)!;
                  return (
                    <article className={`personnel-file npc-${npcState.status}`} key={npc.id}>
                      <div className="personnel-photo"><span>{npc.initials}</span><small>NO PHOTOGRAPH<br />ON FILE</small></div>
                      <div className="personnel-copy">
                        <p className="fact-label">{npc.role} · age {npc.age}</p>
                        <h3>{npc.name}</h3>
                        <p>{npc.background}</p>
                        <dl><div><dt>Home</dt><dd>{npc.hometown}</dd></div><div><dt>Temperament</dt><dd>{npc.temperament}</dd></div><div><dt>Keepsake</dt><dd>{npc.keepsake}</dd></div></dl>
                        <footer><b>{statusLabel(npcState.status)}</b><span>{relationshipLabel(npcState.relationship)}</span></footer>
                        {npcState.epitaph && <p className="personnel-epitaph">{npcState.epitaph}</p>}
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

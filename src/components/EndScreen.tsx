import { useState } from 'react';
import { getNpc } from '../data/npcs';
import { daysSurvived } from '../game/engine';
import { formatDate, statusLabel } from '../game/presentation';
import type { GameState } from '../game/types';

interface EndScreenProps {
  state: GameState;
  onAnotherLife: () => void;
}

const ENDING_LABELS = {
  killed: 'Killed in action',
  wounds: 'Died of wounds',
  invalided: 'Invalided home',
  pow: 'Prisoner of war',
  survived: 'Survived',
};

export function EndScreen({ state, onAnotherLife }: EndScreenProps) {
  const [showDiary, setShowDiary] = useState(false);
  const ending = state.ending!;
  const lived = ending.type === 'survived' || ending.type === 'invalided' || ending.type === 'pow';
  const endYear = new Date(ending.date).getUTCFullYear();
  const laterYear = Math.max(state.character.birthYear + 58, 1956 + (state.seed % 33));
  const recordEndYear = lived ? laterYear : endYear;
  const age = endYear - state.character.birthYear;

  return (
    <main className={`end-screen ending-${ending.type}`}>
      <div className="end-grain" aria-hidden="true" />
      {ending.type === 'survived' && (
        <div className="armistice-sequence" aria-label="At eleven o’clock, the guns fell silent">
          <span className="clock clock-one">10:58</span>
          <span className="clock clock-two">10:59</span>
          <span className="clock clock-three">11:00</span>
          <p>The guns fell silent.</p>
        </div>
      )}
      <section className="end-record">
        <p className="end-classification">{ENDING_LABELS[ending.type]}</p>
        <h1>{state.character.name}</h1>
        <p className="life-years">{state.character.birthYear} — {recordEndYear}</p>
        {!lived && <p className="age-line">Age {age}</p>}
        <div className="end-cause"><p>{ending.cause}</p><time>{formatDate(ending.date, true)} · {state.location}</time></div>
        {ending.postwar && <div className="postwar-record">{ending.postwar.map((line) => <p key={line}>{line}</p>)}</div>}
        <div className="survival-mark">
          <span>{daysSurvived(state)}</span>
          <p>days lived on the Western Front</p>
        </div>
        <p className="final-statement">{lived ? 'You survived the war.' : 'Your war ended here.'}</p>
        <div className="end-actions">
          <button className="button button-ghost" type="button" onClick={() => setShowDiary((value) => !value)}>{showDiary ? 'Close war diary' : 'View war diary'}</button>
          <button className="button button-primary" type="button" onClick={onAnotherLife}>Begin another life</button>
        </div>
      </section>

      {showDiary && (
        <section className="end-diary">
          <header><div><p className="eyebrow">Complete field record</p><h2>War diary</h2></div><button type="button" onClick={() => setShowDiary(false)}>×</button></header>
          <div className="end-summary">
            <div><span>Campaigns</span><p>{state.campaigns.join(' · ') || 'Routine front-line service'}</p></div>
            <div><span>Comrades</span><p>{state.npcs.map((npc) => `${getNpc(npc.id).name}: ${statusLabel(npc.status)}`).join(' · ')}</p></div>
          </div>
          <div className="end-diary-entries">
            {[...state.journal].reverse().map((entry) => <article key={entry.id}><time>{formatDate(entry.date)}</time><h3>{entry.title}</h3><p>{entry.body}</p></article>)}
          </div>
        </section>
      )}
    </main>
  );
}

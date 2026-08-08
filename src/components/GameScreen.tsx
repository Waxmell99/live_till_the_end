import { useState } from 'react';
import { resolveChoice } from '../game/engine';
import { formatDate } from '../game/presentation';
import { saveGame } from '../game/save';
import type { GameState } from '../game/types';
import { useAmbientSound } from '../hooks/useAmbientSound';
import { ComradesPanel } from './ComradesPanel';
import { type DossierTab, Dossier } from './Dossier';
import { EndScreen } from './EndScreen';
import { EventPanel } from './EventPanel';
import { MapPanel } from './MapPanel';
import { StatusPanel } from './StatusPanel';

interface GameScreenProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
  onAnotherLife: () => void;
}

export function GameScreen({ state, onStateChange, onAnotherLife }: GameScreenProps) {
  const [dossier, setDossier] = useState<DossierTab | null>(null);
  const [resolving, setResolving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const ambience = useAmbientSound();

  if (state.status === 'ended') return <EndScreen state={state} onAnotherLife={onAnotherLife} />;

  const choose = (choiceId: string) => {
    if (resolving) return;
    setResolving(true);
    window.setTimeout(() => {
      onStateChange(resolveChoice(state, choiceId));
      setResolving(false);
    }, 260);
  };

  const manualSave = () => {
    saveGame(state);
    setSaveNotice(true);
    window.setTimeout(() => setSaveNotice(false), 1600);
  };

  const toggleLetter = (letterId: string) => {
    const next = structuredClone(state);
    next.letters = next.letters.map((letter) => letter.id === letterId ? { ...letter, saved: !letter.saved } : letter);
    onStateChange(next);
  };

  return (
    <main className="game-screen">
      <header className="game-header">
        <div className="game-brand"><span>FIELD DIARY</span><b>Survive Until the War Ends</b></div>
        <div className="front-context">
          <time>{formatDate(state.currentDate, true)}</time>
          <span>{state.location}</span>
          <span>{state.weather}</span>
        </div>
        <div className="header-actions">
          <button type="button" onClick={ambience.toggle} aria-pressed={ambience.enabled}>{ambience.enabled ? 'Sound on' : 'Sound off'}</button>
          <button type="button" onClick={manualSave}>Save record</button>
        </div>
        {saveNotice && <span className="save-notice" role="status">Field record saved</span>}
      </header>

      <div className="game-layout">
        <StatusPanel state={state} />
        <EventPanel state={state} resolving={resolving} onChoose={choose} />
        <aside className="right-rail">
          <MapPanel state={state} />
          <ComradesPanel state={state} onOpenPersonnel={() => setDossier('personnel')} />
          <nav className="record-actions" aria-label="Field records">
            <button type="button" onClick={() => setDossier('diary')}><span>01</span><b>War diary</b><small>{state.journal.length} entries</small></button>
            <button type="button" onClick={() => setDossier('letters')}><span>02</span><b>Letters home</b><small>{state.letters.length} received</small></button>
            <button type="button" onClick={() => setDossier('archive')}><span>03</span><b>Historical archive</b><small>{state.triggeredHistoryIds.length} records</small></button>
          </nav>
        </aside>
      </div>

      <footer className="game-footer"><span>Turn {state.turn + 1}</span><p>Autosaved after every choice</p><span>11 NOV 1918 · 11:00</span></footer>
      {dossier && <Dossier state={state} initialTab={dossier} onClose={() => setDossier(null)} onToggleLetter={toggleLetter} />}
    </main>
  );
}

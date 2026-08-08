import { useState } from 'react';
import { resolveChoice } from '../game/engine';
import { formatDate } from '../game/presentation';
import { saveGame } from '../game/save';
import type { GameState } from '../game/types';
import { useAmbientSound } from '../hooks/useAmbientSound';
import { useLanguage } from '../i18n';
import { localizeLocation, localizeWeather } from '../i18n/content';
import { ComradesPanel } from './ComradesPanel';
import { type DossierTab, Dossier } from './Dossier';
import { EndScreen } from './EndScreen';
import { EventPanel } from './EventPanel';
import { MapPanel } from './MapPanel';
import { StatusPanel } from './StatusPanel';
import { LanguageSwitcher } from './LanguageSwitcher';

interface GameScreenProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
  onAnotherLife: () => void;
}

export function GameScreen({ state, onStateChange, onAnotherLife }: GameScreenProps) {
  const { language, t } = useLanguage();
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
    <main className={`game-screen lang-${language}`}>
      <header className="game-header">
        <div className="game-brand"><span>{t('header.fieldDiary')}</span><b>{t('header.title')}</b></div>
        <div className="front-context">
          <time>{formatDate(state.currentDate, true, language)}</time>
          <span>{localizeLocation(state.location, language)}</span>
          <span>{localizeWeather(state.weather, language)}</span>
        </div>
        <div className="header-actions">
          <LanguageSwitcher compact />
          <button type="button" onClick={ambience.toggle} aria-pressed={ambience.enabled}>{ambience.enabled ? t('header.soundOn') : t('header.soundOff')}</button>
          <button type="button" onClick={manualSave}>{t('header.save')}</button>
        </div>
        {saveNotice && <span className="save-notice" role="status">{t('header.saved')}</span>}
      </header>

      <div className="game-layout">
        <StatusPanel state={state} />
        <EventPanel state={state} resolving={resolving} onChoose={choose} />
        <aside className="right-rail">
          <MapPanel state={state} />
          <ComradesPanel state={state} onOpenPersonnel={() => setDossier('personnel')} />
          <nav className="record-actions" aria-label={t('record.aria')}>
            <button type="button" onClick={() => setDossier('diary')}><span>01</span><b>{t('record.diary')}</b><small>{t('record.entries', { count: state.journal.length })}</small></button>
            <button type="button" onClick={() => setDossier('letters')}><span>02</span><b>{t('record.letters')}</b><small>{t('record.received', { count: state.letters.length })}</small></button>
            <button type="button" onClick={() => setDossier('archive')}><span>03</span><b>{t('record.archive')}</b><small>{t('record.records', { count: state.triggeredHistoryIds.length })}</small></button>
          </nav>
        </aside>
      </div>

      <footer className="game-footer"><span>{t('footer.turn', { turn: state.turn + 1 })}</span><p>{t('footer.autosave')}</p><span>{t('footer.armistice')}</span></footer>
      {dossier && <Dossier state={state} initialTab={dossier} onClose={() => setDossier(null)} onToggleLetter={toggleLetter} />}
    </main>
  );
}

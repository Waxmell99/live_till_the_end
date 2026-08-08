import { useEffect, useState } from 'react';
import { CharacterCreation } from './components/CharacterCreation';
import { GameScreen } from './components/GameScreen';
import { IntroScreen } from './components/IntroScreen';
import { createNewGame } from './game/engine';
import { clearSave, loadGame, saveGame } from './game/save';
import type { CharacterInput, GameState } from './game/types';
import { LanguageProvider } from './i18n';

type View = 'intro' | 'create' | 'game';

function GameApp() {
  const [savedGame, setSavedGame] = useState<GameState | null>(() => loadGame());
  const [game, setGame] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('intro');

  useEffect(() => {
    if (game) {
      saveGame(game);
      setSavedGame(game);
    }
  }, [game]);

  const begin = (profile: CharacterInput, seed: number) => {
    const state = createNewGame(profile, seed);
    setGame(state);
    setView('game');
  };

  const continueGame = () => {
    if (!savedGame) return;
    setGame(savedGame);
    setView('game');
  };

  const anotherLife = () => {
    clearSave();
    setSavedGame(null);
    setGame(null);
    setView('create');
  };

  if (view === 'intro') {
    return (
      <IntroScreen
        hasSave={Boolean(savedGame)}
        savedName={savedGame?.character.name}
        onContinue={continueGame}
        onNewGame={() => setView('create')}
      />
    );
  }

  if (view === 'create') {
    return <CharacterCreation onBegin={begin} onBack={() => setView('intro')} />;
  }

  if (!game) return null;
  return <GameScreen state={game} onStateChange={setGame} onAnotherLife={anotherLife} />;
}

export default function App() {
  return <LanguageProvider><GameApp /></LanguageProvider>;
}

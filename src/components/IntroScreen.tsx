import { useState } from 'react';

interface IntroScreenProps {
  hasSave: boolean;
  savedName?: string;
  onContinue: () => void;
  onNewGame: () => void;
}

export function IntroScreen({ hasSave, savedName, onContinue, onNewGame }: IntroScreenProps) {
  const [skipped, setSkipped] = useState(false);

  return (
    <main className={`intro-screen ${skipped ? 'intro-skipped' : ''}`}>
      <div className="intro-grain" aria-hidden="true" />
      <button className="intro-skip" type="button" onClick={() => setSkipped(true)}>
        Skip introduction
      </button>
      <div className="intro-sequence" aria-label="1917. The war has already lasted three years. Millions are dead. You do not know when it will end. Stay alive.">
        <p className="intro-line intro-line-one">1917.</p>
        <p className="intro-line intro-line-two">The war has already lasted three years.</p>
        <p className="intro-line intro-line-three">Millions are dead.</p>
        <p className="intro-line intro-line-four">You do not know when it will end.</p>
        <p className="intro-line intro-line-five">Stay alive.</p>
      </div>
      <section className="title-card">
        <p className="eyebrow">An ordinary life on the Western Front</p>
        <h1>Survive Until<br />the War Ends</h1>
        <p className="title-chinese">活到战争结束</p>
        <div className="title-rule"><span>1917</span><i /><span>1918</span></div>
        <p className="title-deck">You will not command armies. You will not change history.<br />Your task is to live through it.</p>
        <div className="title-actions">
          {hasSave && (
            <button className="button button-primary" type="button" onClick={onContinue}>
              Continue {savedName ? `${savedName}’s life` : 'saved life'}
            </button>
          )}
          <button className={`button ${hasSave ? 'button-ghost' : 'button-primary'}`} type="button" onClick={onNewGame}>
            Begin another life
          </button>
        </div>
        {hasSave && <p className="autosave-note">A field record was found in this browser.</p>}
      </section>
    </main>
  );
}

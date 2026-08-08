import { useState } from 'react';
import { useLanguage } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface IntroScreenProps {
  hasSave: boolean;
  savedName?: string;
  onContinue: () => void;
  onNewGame: () => void;
}

export function IntroScreen({ hasSave, savedName, onContinue, onNewGame }: IntroScreenProps) {
  const [skipped, setSkipped] = useState(false);
  const { language, t } = useLanguage();

  return (
    <main className={`intro-screen ${skipped ? 'intro-skipped' : ''} lang-${language}`}>
      <div className="intro-grain" aria-hidden="true" />
      <div className="intro-language"><LanguageSwitcher /></div>
      <button className="intro-skip" type="button" onClick={() => setSkipped(true)}>
        {t('intro.skip')}
      </button>
      <div className="intro-sequence" aria-label={t('intro.aria')}>
        <p className="intro-line intro-line-one">{t('intro.year')}</p>
        <p className="intro-line intro-line-two">{t('intro.threeYears')}</p>
        <p className="intro-line intro-line-three">{t('intro.millions')}</p>
        <p className="intro-line intro-line-four">{t('intro.unknown')}</p>
        <p className="intro-line intro-line-five">{t('intro.survive')}</p>
      </div>
      <section className="title-card">
        <p className="eyebrow">{t('intro.eyebrow')}</p>
        <h1>{t('intro.title.1')}<br />{t('intro.title.2')}</h1>
        <p className="title-chinese">{t('intro.chineseTitle')}</p>
        <div className="title-rule"><span>1917</span><i /><span>1918</span></div>
        <p className="title-deck">{t('intro.deck.1')}<br />{t('intro.deck.2')}</p>
        <div className="title-actions">
          {hasSave && (
            <button className="button button-primary" type="button" onClick={onContinue}>
              {savedName ? t('intro.continue', { name: savedName }) : t('intro.continueGeneric')}
            </button>
          )}
          <button className={`button ${hasSave ? 'button-ghost' : 'button-primary'}`} type="button" onClick={onNewGame}>
            {t('intro.new')}
          </button>
        </div>
        {hasSave && <p className="autosave-note">{t('intro.saveFound')}</p>}
      </section>
    </main>
  );
}

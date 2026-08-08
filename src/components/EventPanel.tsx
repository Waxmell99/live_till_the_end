import { availableChoices, getCurrentEvent } from '../game/engine';
import { renderNarrative } from '../game/presentation';
import type { GameState } from '../game/types';
import { useLanguage, type TranslationKey } from '../i18n';
import { localizeChoice, localizeEvent, localizeJournalEntry } from '../i18n/content';

interface EventPanelProps {
  state: GameState;
  resolving: boolean;
  onChoose: (choiceId: string) => void;
}

function exposureKey(danger?: number): TranslationKey | null {
  if (!danger) return null;
  if (danger >= 0.16) return 'event.extreme';
  if (danger >= 0.1) return 'event.severe';
  if (danger >= 0.06) return 'event.considerable';
  return 'event.limited';
}

export function EventPanel({ state, resolving, onChoose }: EventPanelProps) {
  const { language, t } = useLanguage();
  const sourceEvent = getCurrentEvent(state);
  const event = localizeEvent(sourceEvent, language);
  const choices = availableChoices(state, sourceEvent).map((choice) => localizeChoice(sourceEvent, choice, language));
  const lastEntry = state.journal[state.journal.length - 1];
  const localizedLastEntry = lastEntry ? localizeJournalEntry(lastEntry, state, language) : undefined;

  return (
    <section className={`event-panel event-${event.kind} ${resolving ? 'is-resolving' : ''}`} key={`${event.id}-${state.turn}`}>
      {state.lastResolution.length > 0 && (
        <div className="previous-outcome" aria-live="polite">
          <span>{t('event.lastEntry')}</span>
          <p>{localizedLastEntry?.body ?? state.lastResolution.join(' ')}</p>
        </div>
      )}
      <article className="event-paper">
        <header className="event-header">
          <div>
            <p className="event-kind">{t(`event.kind.${event.kind}` as TranslationKey)}</p>
            <h1>{event.title}</h1>
          </div>
          <span className={`source-seal source-${event.source}`}>
            {event.source === 'historical' ? t('event.recorded') : t('event.personal')}
          </span>
        </header>
        <p className="event-kicker">{event.kicker}</p>
        <div className="event-narrative">
          {event.text.map((paragraph, index) => <p key={index}>{renderNarrative(paragraph, state)}</p>)}
        </div>
        <div className="choice-section">
          <p className="choice-prompt">{t('event.prompt')}</p>
          <div className="choice-list">
            {choices.map((choice, index) => {
              const exposure = exposureKey(choice.risk?.danger);
              return (
                <button type="button" className="choice" key={choice.id} onClick={() => onChoose(choice.id)} disabled={resolving}>
                  <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="choice-copy">
                    <b>{choice.label}</b>
                    <small>{choice.detail}</small>
                    {exposure && <em>{t(exposure)}</em>}
                  </span>
                  <span className="choice-arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
          <p className="choice-caution">{t('event.caution')}</p>
        </div>
      </article>
    </section>
  );
}

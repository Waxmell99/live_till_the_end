import { EVENT_KIND_LABELS } from '../game/constants';
import { availableChoices, getCurrentEvent } from '../game/engine';
import { renderNarrative } from '../game/presentation';
import type { GameState } from '../game/types';

interface EventPanelProps {
  state: GameState;
  resolving: boolean;
  onChoose: (choiceId: string) => void;
}

function exposureLabel(danger?: number): string | null {
  if (!danger) return null;
  if (danger >= 0.16) return 'Extreme exposure';
  if (danger >= 0.1) return 'Severe exposure';
  if (danger >= 0.06) return 'Considerable exposure';
  return 'Limited exposure';
}

export function EventPanel({ state, resolving, onChoose }: EventPanelProps) {
  const event = getCurrentEvent(state);
  const choices = availableChoices(state, event);

  return (
    <section className={`event-panel event-${event.kind} ${resolving ? 'is-resolving' : ''}`} key={`${event.id}-${state.turn}`}>
      {state.lastResolution.length > 0 && (
        <div className="previous-outcome" aria-live="polite">
          <span>Last entry</span>
          <p>{state.lastResolution.join(' ')}</p>
        </div>
      )}
      <article className="event-paper">
        <header className="event-header">
          <div>
            <p className="event-kind">{EVENT_KIND_LABELS[event.kind]}</p>
            <h1>{event.title}</h1>
          </div>
          <span className={`source-seal source-${event.source}`}>
            {event.source === 'historical' ? 'Recorded history' : 'Personal record'}
          </span>
        </header>
        <p className="event-kicker">{event.kicker}</p>
        <div className="event-narrative">
          {event.text.map((paragraph, index) => <p key={index}>{renderNarrative(paragraph, state)}</p>)}
        </div>
        <div className="choice-section">
          <p className="choice-prompt">What do you do?</p>
          <div className="choice-list">
            {choices.map((choice, index) => {
              const exposure = exposureLabel(choice.risk?.danger);
              return (
                <button type="button" className="choice" key={choice.id} onClick={() => onChoose(choice.id)} disabled={resolving}>
                  <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="choice-copy">
                    <b>{choice.label}</b>
                    <small>{choice.detail}</small>
                    {exposure && <em>{exposure}</em>}
                  </span>
                  <span className="choice-arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
          <p className="choice-caution">No choice is guaranteed. Condition, equipment, weather, relationships, and chance all matter.</p>
        </div>
      </article>
    </section>
  );
}

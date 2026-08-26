import { getNpc } from '../data/npcs';
import { availableChoices, getChoiceConsequencePreview, getCurrentEvent, type ChoiceRiskAssessment } from '../game/engine';
import { renderNarrative } from '../game/presentation';
import type { GameState, RiskFactor, StatKey } from '../game/types';
import { useLanguage, type TranslationKey } from '../i18n';
import { localizeChoice, localizeEvent, localizeJournalEntry, localizeNpc } from '../i18n/content';

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

function chance(value: number): string {
  const rounded = Math.round(value * 1000) / 10;
  return rounded > 0 && rounded < 0.1 ? '<0.1%' : `${rounded}%`;
}

function chanceRange(value: { min: number; max: number }): string {
  const minimum = chance(value.min);
  const maximum = chance(value.max);
  return minimum === maximum ? minimum : `${minimum}–${maximum}`;
}

function beneficialStat(key: StatKey, delta: number): boolean {
  return ['health', 'morale'].includes(key) ? delta > 0 : delta < 0;
}

function riskFactorKey(factor: RiskFactor): TranslationKey {
  return `risk.factor.${factor.key}` as TranslationKey;
}

function riskLines(risk: ChoiceRiskAssessment, t: (key: TranslationKey, variables?: Record<string, string | number>) => string) {
  return [
    { key: 'injury', range: risk.injury, text: t('event.injuryChance', { chance: chanceRange(risk.injury) }) },
    { key: 'fatality', range: risk.fatality, text: t('event.deathChance', { chance: chanceRange(risk.fatality) }) },
    { key: 'capture', range: risk.capture, text: t('event.captureChance', { chance: chanceRange(risk.capture) }) },
    ...(risk.comradeIncident ? [{ key: 'comrade', range: risk.comradeIncident, text: t('event.comradeChance', { chance: chanceRange(risk.comradeIncident) }) }] : []),
  ].filter((line) => line.range.max > 0);
}

export function EventPanel({ state, resolving, onChoose }: EventPanelProps) {
  const { language, t } = useLanguage();
  const sourceEvent = getCurrentEvent(state);
  const event = localizeEvent(sourceEvent, language);
  const choices = availableChoices(state, sourceEvent).map((sourceChoice) => ({
    choice: localizeChoice(sourceEvent, sourceChoice, language),
    preview: getChoiceConsequencePreview(state, sourceChoice, sourceEvent),
  }));
  const lastEntry = state.journal[state.journal.length - 1];
  const localizedLastEntry = lastEntry ? localizeJournalEntry(lastEntry, state, language) : undefined;
  const narrativeLabel = event.arcId
    ? t(event.arcStage === 0 ? 'event.threadBegins' : event.arcStage === 3 ? 'event.threadCloses' : 'event.threadContinues')
    : event.tags?.includes('chapter') ? t('event.chapter') : undefined;

  return (
    <section className={`event-panel event-${event.kind} ${resolving ? 'is-resolving' : ''}`} key={`${event.id}-${state.turn}`}>
      {state.lastResolution.length > 0 && (
        <div className="previous-outcome" aria-live="polite">
          <span>{t('event.lastEntry')}</span>
          <p>{localizedLastEntry?.body ?? state.lastResolution.join(' ')}</p>
          {lastEntry?.riskAssessment && (
            <div className="resolution-risk">
              <b>{t('event.riskResolved', { percent: `${lastEntry.riskAssessment.exposurePercent}%` })}</b>
              {lastEntry.riskAssessment.factors.length > 0 && (
                <span>{lastEntry.riskAssessment.factors.map((factor) =>
                  `${t(riskFactorKey(factor))} ${factor.direction === 'raises' ? '↑' : '↓'}${factor.percent}%`,
                ).join(' · ')}</span>
              )}
            </div>
          )}
        </div>
      )}
      <article className="event-paper">
        <header className="event-header">
          <div>
            <p className="event-kind">{t(`event.kind.${event.kind}` as TranslationKey)}{narrativeLabel ? ` · ${narrativeLabel}` : ''}</p>
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
            {choices.map(({ choice, preview }, index) => {
              const exposure = exposureKey(preview.risk?.exposure.max);
              const hasImmediate = preview.stats.length > 0
                || preview.relationships.length > 0
                || preview.addedItems.length > 0
                || preview.removedItems.length > 0;
              return (
                <button type="button" className="choice" key={choice.id} onClick={() => onChoose(choice.id)} disabled={resolving}>
                  <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="choice-copy">
                    <b>{choice.label}</b>
                    <small>{choice.detail}</small>
                    <div className="consequence-preview">
                      <div className="consequence-group guaranteed-effects">
                        <strong>{t('event.guaranteed')}</strong>
                        <div className="consequence-chips">
                          {!hasImmediate && <span className="neutral">{t('event.noImmediate')}</span>}
                          {preview.stats.map(({ key, delta }) => (
                            <span key={key} className={beneficialStat(key, delta) ? 'benefit' : 'cost'}>
                              {t(`status.${key}` as TranslationKey)} {delta > 0 ? '+' : ''}{delta}
                            </span>
                          ))}
                          {preview.relationships.map(({ npcId, delta }) => (
                            <span key={npcId} className={delta > 0 ? 'benefit' : 'cost'}>
                              {localizeNpc(getNpc(npcId), language).name.split(/\s+/)[0]} {delta > 0 ? '+' : ''}{delta}
                            </span>
                          ))}
                          {preview.addedItems.map((item) => (
                            <span key={`add-${item}`} className="benefit">{t('event.itemGain', { item: t(`item.${item}` as TranslationKey) })}</span>
                          ))}
                          {preview.removedItems.map((item) => (
                            <span key={`remove-${item}`} className="cost">{t('event.itemUse', { item: t(`item.${item}` as TranslationKey) })}</span>
                          ))}
                          <span className="neutral">
                            {t('event.time')}: {t(`event.time.${preview.advance.unit}` as TranslationKey, {
                              min: preview.advance.min,
                              max: preview.advance.max,
                            })}
                          </span>
                          {preview.affectsStory && <span className="story-effect">{t('event.storyMemory')}</span>}
                        </div>
                      </div>
                      {preview.risk && (
                        <div className="consequence-group possible-effects">
                          <strong>{t('event.possible')}</strong>
                          <div className="risk-heading">
                            {exposure && <em>{t(exposure)} · {chanceRange(preview.risk.exposure)}</em>}
                            <span>{t('event.atRiskYou')}</span>
                            {preview.risk.comradeIncident && <span>{t('event.atRiskComrade')}</span>}
                          </div>
                          <div className="consequence-chips risk-outcomes">
                            {riskLines(preview.risk, t).map((line) => <span key={line.key}>{line.text}</span>)}
                          </div>
                          {preview.risk.factors.length > 0 && (
                            <div className="risk-reasons">
                              <b>{t('event.riskReasons')}</b>
                              {preview.risk.factors.map((factor) => (
                                <span key={`${factor.key}-${factor.direction}`} className={factor.direction}>
                                  {t(riskFactorKey(factor))} {factor.direction === 'raises' ? '↑' : '↓'}{factor.percent}%
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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

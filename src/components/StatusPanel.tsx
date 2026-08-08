import type { GameState, StatKey } from '../game/types';
import { useLanguage, type TranslationKey } from '../i18n';
import { localizeProfileValue } from '../i18n/content';

interface StatusPanelProps {
  state: GameState;
}

const STATS: Array<{ key: StatKey; inverse?: boolean }> = [
  { key: 'health' },
  { key: 'morale' },
  { key: 'stress', inverse: true },
  { key: 'hunger', inverse: true },
  { key: 'fatigue', inverse: true },
];

function conditionKey(key: StatKey, value: number): TranslationKey {
  if (key === 'health') return value > 74 ? 'status.sound' : value > 44 ? 'status.hurt' : value > 19 ? 'status.poor' : 'status.critical';
  if (key === 'morale') return value > 74 ? 'status.steady' : value > 44 ? 'status.holding' : value > 19 ? 'status.low' : 'status.failing';
  return value < 26 ? 'status.low' : value < 56 ? 'status.present' : value < 81 ? 'status.high' : 'status.severe';
}

export function StatusPanel({ state }: StatusPanelProps) {
  const { language, t } = useLanguage();
  return (
    <aside className="status-panel paper-panel" aria-label={t('status.aria')}>
      <div className="panel-heading">
        <span>{t('status.record')}</span>
        <b>{t('status.number', { number: String(state.seed).slice(-6).padStart(6, '0') })}</b>
      </div>
      <div className="identity-block">
        <p className="identity-rank">{t('status.rank')}</p>
        <h2>{state.character.name}</h2>
        <p>{state.character.age} · {localizeProfileValue(state.character.occupation, language)}</p>
        <p>{localizeProfileValue(state.character.hometown, language)}</p>
      </div>
      <div className="status-list">
        {STATS.map(({ key, inverse }) => {
          const value = state.stats[key];
          const warning = inverse ? value > 74 : value < 30;
          const label = t(`status.${key}` as TranslationKey);
          return (
            <div className={`status-row ${warning ? 'status-warning' : ''}`} key={key}>
              <div className="status-copy">
                <span>{t(`status.${key}` as TranslationKey)}</span>
                <small>{t(conditionKey(key, value))}</small>
                <b>{value}</b>
              </div>
              <div className="status-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
                <i style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="kit-block">
        <h3>{t('status.kit')}</h3>
        {state.inventory.length ? (
          <ul>{state.inventory.map((item) => <li key={item}>{t(`item.${item}` as TranslationKey)}</li>)}</ul>
        ) : <p>{t('status.noKit')}</p>}
      </div>
      <div className="seed-note">
        <span>{t('status.challengeSeed')}</span>
        <code>{state.seed}</code>
      </div>
    </aside>
  );
}

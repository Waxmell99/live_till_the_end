import { ITEM_LABELS } from '../game/constants';
import type { GameState, StatKey } from '../game/types';

interface StatusPanelProps {
  state: GameState;
}

const STATS: Array<{ key: StatKey; label: string; inverse?: boolean }> = [
  { key: 'health', label: 'Health' },
  { key: 'morale', label: 'Morale' },
  { key: 'stress', label: 'Stress', inverse: true },
  { key: 'hunger', label: 'Hunger', inverse: true },
  { key: 'fatigue', label: 'Fatigue', inverse: true },
];

function conditionWord(key: StatKey, value: number): string {
  if (key === 'health') return value > 74 ? 'Sound' : value > 44 ? 'Hurt' : value > 19 ? 'Poor' : 'Critical';
  if (key === 'morale') return value > 74 ? 'Steady' : value > 44 ? 'Holding' : value > 19 ? 'Low' : 'Failing';
  return value < 26 ? 'Low' : value < 56 ? 'Present' : value < 81 ? 'High' : 'Severe';
}

export function StatusPanel({ state }: StatusPanelProps) {
  return (
    <aside className="status-panel paper-panel" aria-label="Soldier status">
      <div className="panel-heading">
        <span>Field record</span>
        <b>No. {String(state.seed).slice(-6).padStart(6, '0')}</b>
      </div>
      <div className="identity-block">
        <p className="identity-rank">Private</p>
        <h2>{state.character.name}</h2>
        <p>{state.character.age} · {state.character.occupation}</p>
        <p>{state.character.hometown}</p>
      </div>
      <div className="status-list">
        {STATS.map(({ key, label, inverse }) => {
          const value = state.stats[key];
          const warning = inverse ? value > 74 : value < 30;
          return (
            <div className={`status-row ${warning ? 'status-warning' : ''}`} key={key}>
              <div className="status-copy">
                <span>{label}</span>
                <small>{conditionWord(key, value)}</small>
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
        <h3>On your person</h3>
        {state.inventory.length ? (
          <ul>{state.inventory.map((item) => <li key={item}>{ITEM_LABELS[item] ?? item}</li>)}</ul>
        ) : <p>Nothing beyond standard kit.</p>}
      </div>
      <div className="seed-note">
        <span>Challenge seed</span>
        <code>{state.seed}</code>
      </div>
    </aside>
  );
}

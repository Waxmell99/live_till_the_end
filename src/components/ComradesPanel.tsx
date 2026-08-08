import { NPC_DEFINITIONS } from '../data/npcs';
import { relationshipLabel, statusLabel } from '../game/presentation';
import type { GameState } from '../game/types';

interface ComradesPanelProps {
  state: GameState;
  onOpenPersonnel: () => void;
}

export function ComradesPanel({ state, onOpenPersonnel }: ComradesPanelProps) {
  return (
    <section className="comrades-card">
      <div className="side-heading"><span>Your section</span><button type="button" onClick={onOpenPersonnel}>Personnel file</button></div>
      <div className="comrade-list">
        {state.npcs.map((npcState) => {
          const npc = NPC_DEFINITIONS.find((candidate) => candidate.id === npcState.id)!;
          return (
            <button className={`comrade-row npc-${npcState.status}`} type="button" key={npc.id} onClick={onOpenPersonnel}>
              <span className="comrade-portrait">{npc.initials}</span>
              <span className="comrade-copy">
                <b>{npc.name}</b>
                <small>{statusLabel(npcState.status)} · {relationshipLabel(npcState.relationship)}</small>
              </span>
              <i style={{ '--bond': `${npcState.relationship}%` } as React.CSSProperties} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

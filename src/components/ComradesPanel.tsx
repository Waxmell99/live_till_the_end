import { NPC_DEFINITIONS } from '../data/npcs';
import { relationshipLabel, statusLabel } from '../game/presentation';
import type { GameState } from '../game/types';
import { useLanguage } from '../i18n';

interface ComradesPanelProps {
  state: GameState;
  onOpenPersonnel: () => void;
}

export function ComradesPanel({ state, onOpenPersonnel }: ComradesPanelProps) {
  const { language, t } = useLanguage();
  return (
    <section className="comrades-card">
      <div className="side-heading"><span>{t('comrades.section')}</span><button type="button" onClick={onOpenPersonnel}>{t('comrades.file')}</button></div>
      <div className="comrade-list">
        {state.npcs.map((npcState) => {
          const npc = NPC_DEFINITIONS.find((candidate) => candidate.id === npcState.id)!;
          return (
            <button className={`comrade-row npc-${npcState.status}`} type="button" key={npc.id} onClick={onOpenPersonnel}>
              <span className="comrade-portrait">{npc.initials}</span>
              <span className="comrade-copy">
                <b>{npc.name}</b>
                <small>{statusLabel(npcState.status, language)} · {relationshipLabel(npcState.relationship, language)}</small>
              </span>
              <i style={{ '--bond': `${npcState.relationship}%` } as React.CSSProperties} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

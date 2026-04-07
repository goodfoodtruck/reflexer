import React, { useRef, useEffect } from 'react';
import { useGameStore } from '@infra/react/hooks/useGameStore';
import { gameStore } from '@infra/bridge/GameStore';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';

function formatEvent(event: BattleEvent): string {
  switch (event.type) {
    case 'BATTLE_STARTED':
      return '── Combat commencé ──';
    case 'TURN_STARTED':
      return `Tour ${event.turnNumber} ▸ ${event.activeEntityId}`;
    case 'ENTITY_MOVED':
      return `${event.entityId} se déplace vers (${event.to.x},${event.to.y})`;
    case 'SPELL_CAST':
      return `${event.casterId} lance ${event.spellId} ➜ ${event.targetIds.join(', ')}`;
    case 'DAMAGE_TAKEN':
      return `${event.targetId} subit ${event.amount} dégâts${event.isCritical ? ' CRIT!' : ''} (${event.remainingHp} PV)`;
    case 'HEAL_RECEIVED':
      return `${event.targetId} récupère ${event.amount} PV (${event.remainingHp} PV)`;
    case 'STATUS_APPLIED':
      return `${event.targetId} ◆ ${event.effect.type} (${event.effect.remainingTurns} tours)`;
    case 'STATUS_EXPIRED':
      return `${event.targetId} ◇ ${event.effect.type} expiré`;
    case 'ENTITY_DIED':
      return `☠ ${event.entityId} est mort`;
    case 'BATTLE_ENDED':
      return `══ ${event.winnerTeam} gagne ! ══`;
    default:
      return event.type;
  }
}

export function BattleHUD(): React.ReactElement {
  const store = useGameStore();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [store.battleLog.length]);

  const handleTick = () => gameStore.tickBattle();
  const handleAutoPlay = () => gameStore.autoPlayBattle(350);
  const handleStop = () => gameStore.stopAutoPlay();
  const handleStart = () => gameStore.startBattle();

  const isStarted = store.battleState && store.battleState.turnNumber > 0;
  const isOver = store.battleEngine?.isOver();

  return (
    <div style={styles.container}>
      {/* Contrôles */}
      <div style={styles.controls}>
        {!isStarted && !isOver && (
          <button style={styles.btn} onClick={handleStart}>
            ▶ Lancer le combat
          </button>
        )}
        {isStarted && !isOver && !store.isAutoPlaying && (
          <>
            <button style={styles.btn} onClick={handleTick}>
              ⏭ Tour suivant
            </button>
            <button style={{ ...styles.btn, ...styles.btnAuto }} onClick={handleAutoPlay}>
              ⏩ Auto
            </button>
          </>
        )}
        {store.isAutoPlaying && (
          <button style={{ ...styles.btn, ...styles.btnStop }} onClick={handleStop}>
            ⏹ Stop
          </button>
        )}
        {isOver && (
          <div style={styles.result}>
            {isOver.winner === 'PLAYER' ? '🎉 Victoire !' : '💀 Défaite...'}
          </div>
        )}
      </div>

      {/* Entités */}
      <div style={styles.entities}>
        {store.battleState &&
          [...store.battleState.entities.values()].map((e) => (
            <div
              key={e.id}
              style={{
                ...styles.entityCard,
                opacity: e.isAlive ? 1 : 0.3,
                borderColor: e.team === 'PLAYER' ? '#3b82f6' : '#ef4444',
              }}
            >
              <span style={styles.entityName}>{e.name}</span>
              <span style={styles.entityHp}>
                {e.health.current}/{e.health.max}
              </span>
            </div>
          ))}
      </div>

      {/* Log */}
      <div ref={logRef} style={styles.log}>
        {store.battleLog.map((event, i) => (
          <div key={i} style={styles.logEntry}>
            {formatEvent(event)}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '280px',
    height: '100%',
    background: 'rgba(15,23,42,0.92)',
    borderLeft: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"JetBrains Mono", monospace',
    color: '#e2e8f0',
    fontSize: '11px',
    overflow: 'hidden',
  },
  controls: {
    padding: '12px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    borderBottom: '1px solid #1e293b',
  },
  btn: {
    padding: '6px 12px',
    fontSize: '11px',
    fontFamily: 'inherit',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  btnAuto: { background: '#22c55e' },
  btnStop: { background: '#ef4444' },
  result: {
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '4px',
  },
  entities: {
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    borderBottom: '1px solid #1e293b',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  entityCard: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid',
    background: 'rgba(30,41,59,0.5)',
  },
  entityName: { fontWeight: 'bold' },
  entityHp: { color: '#94a3b8' },
  log: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 12px',
  },
  logEntry: {
    padding: '2px 0',
    borderBottom: '1px solid rgba(51,65,85,0.3)',
    lineHeight: 1.5,
  },
};

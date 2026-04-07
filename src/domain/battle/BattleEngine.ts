import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { BattleState } from '@domain/battle/BattleState';
import {
  BattlePhase,
  createInitialBattleState,
} from '@domain/battle/BattleState';
import type { BattleEntity } from '@domain/battle/components';
import type { Command } from '@domain/battle/commands/Command';
import type { GridConfig, Team } from '@domain/shared/types';
import { BattleFSM } from '@domain/battle/state-machine/BattleFSM';

export type BattleEventCallback = (events: BattleEvent[]) => void;

/**
 * BattleEngine — orchestre le combat tour par tour.
 *
 * Usage:
 *   const engine = new BattleEngine(entities, gridConfig);
 *   engine.onEvents(callback); // pour le rendu
 *   engine.start();
 *   while (!engine.isOver()) {
 *     await engine.tick(); // avance d'un step (1 tour d'entité)
 *   }
 */
export class BattleEngine {
  private state: BattleState;
  private fsm: BattleFSM;
  private listeners: BattleEventCallback[] = [];

  constructor(entities: BattleEntity[], gridConfig: GridConfig) {
    this.state = createInitialBattleState(entities, gridConfig);
    this.fsm = new BattleFSM();
  }

  // ─── API publique ──────────────────────────────────────────

  onEvents(callback: BattleEventCallback): void {
    this.listeners.push(callback);
  }

  getState(): BattleState {
    return this.state;
  }

  isOver(): { winner: Team } | null {
    if (this.state.phase !== BattlePhase.Ended) return null;
    const endEvent = this.state.eventLog.find(
      (e) => e.type === 'BATTLE_ENDED',
    );
    if (!endEvent || endEvent.type !== 'BATTLE_ENDED') return null;
    return { winner: endEvent.winnerTeam };
  }

  /**
   * Démarre le combat (phase NotStarted → TurnStart).
   */
  start(): BattleEvent[] {
    if (this.state.phase !== BattlePhase.NotStarted) return [];

    const { events } = this.fsm.advanceStart(this.state);
    this.applyEvents(events);
    this.emit(events);
    return events;
  }

  /**
   * Avance d'un step complet :
   *   TurnStart → Execution → TurnEnd → VictoryCheck
   * Retourne tous les events produits.
   */
  tick(): BattleEvent[] {
    if (this.state.phase === BattlePhase.Ended) return [];

    const allEvents: BattleEvent[] = [];

    // 1. Turn Start (status ticks + resolve automation)
    const turnStart = this.fsm.advanceTurnStart(this.state);
    this.applyEvents(turnStart.events);
    allEvents.push(...turnStart.events);

    // 2. Execute commands (automatismes résolus)
    for (const command of turnStart.commands) {
      const cmdEvents = this.executeCommand(command);
      allEvents.push(...cmdEvents);
    }

    // 3. Turn End (cooldown ticks)
    const turnEnd = this.fsm.advanceTurnEnd(this.state);
    this.applyEvents(turnEnd.events);
    allEvents.push(...turnEnd.events);

    // 4. Victory Check
    const victoryCheck = this.fsm.advanceVictoryCheck(this.state);
    this.applyEvents(victoryCheck.events);
    allEvents.push(...victoryCheck.events);

    this.emit(allEvents);
    return allEvents;
  }

  /**
   * Exécute manuellement une commande (utile pour le debug).
   */
  executeCommand(command: Command): BattleEvent[] {
    const events = command.execute(this.state);
    this.applyEvents(events);
    return events;
  }

  // ─── Application des events au state ───────────────────────

  private applyEvents(events: BattleEvent[]): void {
    for (const event of events) {
      this.applyEvent(event);
      this.state.eventLog.push(event);
    }
  }

  private applyEvent(event: BattleEvent): void {
    switch (event.type) {
      case 'ENTITY_MOVED': {
        const entity = this.state.entities.get(event.entityId);
        if (entity) {
          entity.position.x = event.to.x;
          entity.position.y = event.to.y;
        }
        break;
      }
      case 'DAMAGE_TAKEN': {
        const entity = this.state.entities.get(event.targetId);
        if (entity) {
          entity.health.current = event.remainingHp;
        }
        break;
      }
      case 'HEAL_RECEIVED': {
        const entity = this.state.entities.get(event.targetId);
        if (entity) {
          entity.health.current = event.remainingHp;
        }
        break;
      }
      case 'STATUS_APPLIED': {
        const entity = this.state.entities.get(event.targetId);
        if (entity) {
          entity.statusEffects.effects.push({ ...event.effect });
        }
        break;
      }
      case 'STATUS_EXPIRED': {
        const entity = this.state.entities.get(event.targetId);
        if (entity) {
          entity.statusEffects.effects = entity.statusEffects.effects.filter(
            (e) =>
              !(
                e.type === event.effect.type &&
                e.sourceId === event.effect.sourceId
              ),
          );
        }
        break;
      }
      case 'STATUS_TICKED': {
        // Déjà géré par DAMAGE_TAKEN/HEAL_RECEIVED
        break;
      }
      case 'COOLDOWN_TICKED': {
        const entity = this.state.entities.get(event.entityId);
        if (entity) {
          if (event.remainingCooldown <= 0) {
            entity.spells.cooldowns.delete(event.spellId);
          } else {
            entity.spells.cooldowns.set(event.spellId, event.remainingCooldown);
          }
        }
        break;
      }
      case 'SPELL_CAST': {
        const entity = this.state.entities.get(event.casterId);
        if (entity) {
          const spell = entity.spells.spells.find((s) => s.id === event.spellId);
          if (spell && spell.cooldown > 0) {
            entity.spells.cooldowns.set(spell.id, spell.cooldown);
          }
        }
        break;
      }
      case 'ENTITY_DIED': {
        const entity = this.state.entities.get(event.entityId);
        if (entity) {
          entity.isAlive = false;
        }
        break;
      }
      case 'BATTLE_STARTED':
      case 'TURN_STARTED':
      case 'TURN_ENDED':
      case 'BATTLE_ENDED':
        // Pas de mutation state nécessaire
        break;
    }
  }

  // ─── Emission vers les listeners ───────────────────────────

  private emit(events: BattleEvent[]): void {
    if (events.length === 0) return;
    for (const listener of this.listeners) {
      listener(events);
    }
  }
}

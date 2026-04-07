import type { BattleState } from '@domain/battle/BattleState';
import { BattlePhase, isTeamWiped } from '@domain/battle/BattleState';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import { createEvent } from '@domain/battle/events/BattleEvent';
import { Team } from '@domain/shared/types';
import { TurnOrderSystem } from '@domain/battle/systems/TurnOrderSystem';
import { StatusSystem } from '@domain/battle/systems/StatusSystem';
import { AutomationSystem } from '@domain/battle/systems/AutomationSystem';
import type { Command } from '@domain/battle/commands/Command';

export type PhaseResult = {
  events: BattleEvent[];
  commands: Command[];
};

/**
 * Machine à états du combat.
 * Chaque méthode advance* fait progresser la FSM d'une phase
 * et retourne les events + commandes générées.
 */
export class BattleFSM {
  private turnOrderSystem = new TurnOrderSystem();
  private statusSystem = new StatusSystem();
  private automationSystem = new AutomationSystem();

  /**
   * Démarre le combat : calcule l'ordre du premier tour.
   */
  advanceStart(state: BattleState): PhaseResult {
    state.phase = BattlePhase.TurnStart;
    state.turnNumber = 1;
    state.turnOrder = this.turnOrderSystem.computeTurnOrder(state);
    state.currentTurnIndex = 0;

    const entityIds = [...state.entities.keys()];
    const events: BattleEvent[] = [
      createEvent({ type: 'BATTLE_STARTED' as const, entityIds }),
    ];

    return { events, commands: [] };
  }

  /**
   * Début du tour d'une entité : tick status, puis résout l'automatisme.
   */
  advanceTurnStart(state: BattleState): PhaseResult {
    const entityId = state.turnOrder[state.currentTurnIndex];
    if (!entityId) return { events: [], commands: [] };

    const entity = state.entities.get(entityId);
    if (!entity || !entity.isAlive) {
      // Skip entités mortes
      return this.skipToNext(state);
    }

    state.phase = BattlePhase.Execution;

    const events: BattleEvent[] = [
      createEvent({
        type: 'TURN_STARTED' as const,
        turnNumber: state.turnNumber,
        activeEntityId: entityId,
      }),
    ];

    // Tick des effets de statut
    const statusEvents = this.statusSystem.tickEffects(entityId, state);
    events.push(...statusEvents);

    // Vérifier si l'entité est morte du poison etc.
    const diedFromStatus = statusEvents.some(
      (e) => e.type === 'ENTITY_DIED' && (e as any).entityId === entityId,
    );
    if (diedFromStatus) {
      return { events, commands: [] };
    }

    // Résoudre l'automatisme → Command
    const command = this.automationSystem.resolveAutomation(entityId, state);
    const commands = command ? [command] : [];

    return { events, commands };
  }

  /**
   * Fin du tour : tick cooldowns, passe au suivant.
   */
  advanceTurnEnd(state: BattleState): PhaseResult {
    const entityId = state.turnOrder[state.currentTurnIndex];
    if (!entityId) return { events: [], commands: [] };

    state.phase = BattlePhase.TurnEnd;

    const events: BattleEvent[] = [];

    // Tick cooldowns
    events.push(...this.statusSystem.tickCooldowns(entityId, state));

    events.push(
      createEvent({
        type: 'TURN_ENDED' as const,
        turnNumber: state.turnNumber,
        entityId,
      }),
    );

    return { events, commands: [] };
  }

  /**
   * Vérifie si le combat est terminé.
   */
  advanceVictoryCheck(state: BattleState): PhaseResult {
    state.phase = BattlePhase.VictoryCheck;

    const playerWiped = isTeamWiped(state, Team.Player);
    const enemyWiped = isTeamWiped(state, Team.Enemy);

    if (playerWiped || enemyWiped) {
      state.phase = BattlePhase.Ended;
      const winnerTeam = enemyWiped ? Team.Player : Team.Enemy;
      return {
        events: [createEvent({ type: 'BATTLE_ENDED' as const, winnerTeam })],
        commands: [],
      };
    }

    // Passer à l'entité suivante ou au tour suivant
    return this.advanceToNextEntity(state);
  }

  private advanceToNextEntity(state: BattleState): PhaseResult {
    state.currentTurnIndex++;

    if (state.currentTurnIndex >= state.turnOrder.length) {
      // Nouveau round
      state.turnNumber++;
      state.turnOrder = this.turnOrderSystem.computeTurnOrder(state);
      state.currentTurnIndex = 0;
    }

    state.phase = BattlePhase.TurnStart;
    return { events: [], commands: [] };
  }

  private skipToNext(state: BattleState): PhaseResult {
    return this.advanceToNextEntity(state);
  }
}

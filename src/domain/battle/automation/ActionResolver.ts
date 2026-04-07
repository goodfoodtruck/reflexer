import type { AutomationAction, EntityId } from '@domain/shared/types';
import { ActionType } from '@domain/shared/types';
import type { BattleState } from '@domain/battle/BattleState';
import type { Command } from '@domain/battle/commands/Command';
import { MoveCommand } from '@domain/battle/commands/MoveCommand';
import { CastSpellCommand } from '@domain/battle/commands/CastSpellCommand';
import { PassTurnCommand } from '@domain/battle/commands/PassTurnCommand';
import { GridSystem } from '@domain/battle/systems/GridSystem';

export class ActionResolver {
  /**
   * Traduit une AutomationAction + cible résolue en Command exécutable.
   */
  resolve(
    action: AutomationAction,
    entityId: EntityId,
    targetId: EntityId | null,
    state: BattleState,
  ): Command | null {
    const entity = state.entities.get(entityId);
    if (!entity) return null;

    const gridSystem = new GridSystem(state.grid);

    switch (action.type) {
      case ActionType.CastSpell: {
        const spellId = action.params['spellId'];
        if (!spellId || !targetId) return null;

        const target = state.entities.get(targetId);
        if (!target) return null;

        const spell = entity.spells.spells.find((s) => s.id === spellId);
        if (!spell) return null;

        // Vérifier portée — si trop loin, se déplacer vers la cible
        const dist = gridSystem.manhattanDistance(
          entity.position,
          target.position,
        );
        if (dist > spell.range) {
          // On se rapproche plutôt que de caster
          const moveTarget = gridSystem.findNearestFreeCell(
            entity.position,
            target.position,
            state,
          );
          if (moveTarget) return new MoveCommand(entityId, moveTarget);
          return null;
        }

        return new CastSpellCommand(entityId, spellId, target.position);
      }

      case ActionType.Move: {
        if (!targetId) return null;
        const target = state.entities.get(targetId);
        if (!target) return null;

        const moveTarget = gridSystem.findNearestFreeCell(
          entity.position,
          target.position,
          state,
        );
        if (moveTarget) return new MoveCommand(entityId, moveTarget);
        return null;
      }

      case ActionType.Flee: {
        // Fuir = s'éloigner de la cible
        if (!targetId) return null;
        const target = state.entities.get(targetId);
        if (!target) return null;

        const neighbors = gridSystem.getNeighbors(entity.position);
        const freeNeighbors = neighbors.filter(
          (n) => !gridSystem.isBlocked(n, state),
        );
        if (freeNeighbors.length === 0) return null;

        // Choisir la case qui maximise la distance à la cible
        let best = freeNeighbors[0];
        let bestDist = gridSystem.manhattanDistance(best, target.position);
        for (const n of freeNeighbors) {
          const d = gridSystem.manhattanDistance(n, target.position);
          if (d > bestDist) {
            bestDist = d;
            best = n;
          }
        }
        return new MoveCommand(entityId, best);
      }

      case ActionType.Defend:
        // Défendre = passer le tour avec un buff shield implicite
        // Pour le prototype, on passe simplement
        return new PassTurnCommand(entityId);

      case ActionType.PassTurn:
        return new PassTurnCommand(entityId);

      default:
        return null;
    }
  }
}

import type { AutomationTarget, EntityId } from '@domain/shared/types';
import { TargetType } from '@domain/shared/types';
import type { BattleState } from '@domain/battle/BattleState';
import { getAliveEntities } from '@domain/battle/BattleState';
import { GridSystem } from '@domain/battle/systems/GridSystem';

export class TargetSelector {
  /**
   * Retourne l'EntityId de la cible résolue, ou null si aucune cible valide.
   */
  resolve(
    target: AutomationTarget,
    sourceId: EntityId,
    state: BattleState,
  ): EntityId | null {
    const source = state.entities.get(sourceId);
    if (!source) return null;

    const gridSystem = new GridSystem(state.grid);
    const alive = getAliveEntities(state);
    const enemies = alive.filter((e) => e.team !== source.team);
    const allies = alive.filter(
      (e) => e.team === source.team && e.id !== sourceId,
    );

    switch (target.type) {
      case TargetType.Self:
        return sourceId;

      case TargetType.NearestEnemy:
        return this.nearest(sourceId, enemies, gridSystem, source.position);

      case TargetType.WeakestEnemy:
        return this.weakest(enemies);

      case TargetType.StrongestEnemy:
        return this.strongest(enemies);

      case TargetType.FurthestEnemy:
        return this.furthest(enemies, gridSystem, source.position);

      case TargetType.NearestAlly:
        return this.nearest(sourceId, allies, gridSystem, source.position);

      case TargetType.WeakestAlly:
        return this.weakest(allies);

      default:
        return null;
    }
  }

  private nearest(
    _sourceId: EntityId,
    candidates: { id: EntityId; position: { x: number; y: number } }[],
    grid: GridSystem,
    from: { x: number; y: number },
  ): EntityId | null {
    if (candidates.length === 0) return null;
    let best = candidates[0];
    let bestDist = grid.manhattanDistance(from, best.position);
    for (let i = 1; i < candidates.length; i++) {
      const dist = grid.manhattanDistance(from, candidates[i].position);
      if (dist < bestDist) {
        bestDist = dist;
        best = candidates[i];
      }
    }
    return best.id;
  }

  private furthest(
    candidates: { id: EntityId; position: { x: number; y: number } }[],
    grid: GridSystem,
    from: { x: number; y: number },
  ): EntityId | null {
    if (candidates.length === 0) return null;
    let best = candidates[0];
    let bestDist = grid.manhattanDistance(from, best.position);
    for (let i = 1; i < candidates.length; i++) {
      const dist = grid.manhattanDistance(from, candidates[i].position);
      if (dist > bestDist) {
        bestDist = dist;
        best = candidates[i];
      }
    }
    return best.id;
  }

  private weakest(
    candidates: { id: EntityId; health: { current: number } }[],
  ): EntityId | null {
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) =>
      a.health.current < b.health.current ? a : b,
    ).id;
  }

  private strongest(
    candidates: { id: EntityId; health: { current: number } }[],
  ): EntityId | null {
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) =>
      a.health.current > b.health.current ? a : b,
    ).id;
  }
}

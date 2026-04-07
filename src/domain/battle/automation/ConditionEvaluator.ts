import type { EntityId, ConditionBlock } from '@domain/shared/types';
import { ConditionType } from '@domain/shared/types';
import type { BattleState } from '@domain/battle/BattleState';
import { getAliveEntities } from '@domain/battle/BattleState';
import { GridSystem } from '@domain/battle/systems/GridSystem';

export class ConditionEvaluator {
  /**
   * Évalue un tableau de ConditionBlock.
   * Tous les blocs doivent être satisfaits (ET entre blocs).
   * Au sein d'un bloc, toutes les conditions atomiques doivent être satisfaites (ET).
   */
  evaluateBlocks(
    blocks: ConditionBlock[],
    entityId: EntityId,
    state: BattleState,
  ): boolean {
    if (blocks.length === 0) return true; // pas de condition = toujours vrai

    for (const block of blocks) {
      if (!this.evaluateBlock(block, entityId, state)) {
        return false; // AND entre blocs
      }
    }
    return true;
  }

  private evaluateBlock(
    block: ConditionBlock,
    entityId: EntityId,
    state: BattleState,
  ): boolean {
    if (block.conditions.length === 0) return true;

    for (const atomic of block.conditions) {
      if (!this.evaluateAtomic(atomic.value.conditionType, atomic.value.params, entityId, state)) {
        return false; // AND entre conditions atomiques
      }
    }
    return true;
  }

  private evaluateAtomic(
    conditionType: string,
    params: Record<string, number>,
    entityId: EntityId,
    state: BattleState,
  ): boolean {
    const entity = state.entities.get(entityId);
    if (!entity) return false;

    const gridSystem = new GridSystem(state.grid);

    switch (conditionType) {
      case 'ALWAYS':
        return true;

      case ConditionType.HealthBelow:
      case 'HEALTH_BELOW': {
        const threshold = params['threshold'] ?? 50;
        return (entity.health.current / entity.health.max) * 100 < threshold;
      }

      case ConditionType.HealthAbove:
      case 'HEALTH_ABOVE': {
        const threshold = params['threshold'] ?? 50;
        return (entity.health.current / entity.health.max) * 100 > threshold;
      }

      case ConditionType.EnemyInRange:
      case 'ENEMY_IN_RANGE': {
        const range = params['range'] ?? entity.stats.range;
        const enemies = getAliveEntities(state).filter(e => e.team !== entity.team);
        return enemies.some(e => gridSystem.manhattanDistance(entity.position, e.position) <= range);
      }

      case ConditionType.AllyInRange:
      case 'ALLY_IN_RANGE': {
        const range = params['range'] ?? entity.stats.range;
        const allies = getAliveEntities(state).filter(e => e.team === entity.team && e.id !== entityId);
        return allies.some(e => gridSystem.manhattanDistance(entity.position, e.position) <= range);
      }

      case ConditionType.AllyHealthBelow:
      case 'ALLY_HEALTH_BELOW': {
        const threshold = params['threshold'] ?? 50;
        const allies = getAliveEntities(state).filter(e => e.team === entity.team && e.id !== entityId);
        return allies.some(e => (e.health.current / e.health.max) * 100 < threshold);
      }

      case 'ALLY_HEALTH_ABOVE': {
        const threshold = params['threshold'] ?? 50;
        const allies = getAliveEntities(state).filter(e => e.team === entity.team && e.id !== entityId);
        return allies.some(e => (e.health.current / e.health.max) * 100 > threshold);
      }

      case ConditionType.EnemyCount:
      case 'ENEMY_COUNT': {
        const count = params['count'] ?? 1;
        const enemies = getAliveEntities(state).filter(e => e.team !== entity.team);
        return enemies.length >= count;
      }

      case 'ENEMY_COUNT_AT_RANGE': {
        const range = params['range'] ?? 1;
        const min = params['min'] ?? 2;
        const enemies = getAliveEntities(state).filter(e => e.team !== entity.team);
        const inRange = enemies.filter(e => gridSystem.manhattanDistance(entity.position, e.position) <= range);
        return inRange.length >= min;
      }

      case ConditionType.HasStatusEffect:
      case 'HAS_STATUS': {
        const effectType = params['effectType'];
        if (effectType === undefined) return false;
        return entity.statusEffects.effects.some(e => e.type === String(effectType));
      }

      case 'ALLY_HAS_STATUS': {
        const effectType = params['effectType'];
        if (effectType === undefined) return false;
        const allies = getAliveEntities(state).filter(e => e.team === entity.team && e.id !== entityId);
        return allies.some(a => a.statusEffects.effects.some(e => e.type === String(effectType)));
      }

      case 'STAT_ABOVE': {
        const threshold = params['threshold'] ?? 0;
        // stat 1 = def
        return entity.stats.def > threshold;
      }

      case 'STAT_BELOW': {
        const threshold = params['threshold'] ?? 0;
        return entity.stats.def < threshold;
      }

      default:
        return false;
    }
  }
}

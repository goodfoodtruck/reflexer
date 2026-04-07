import type { Command } from './Command';
import type { BattleState } from '@domain/battle/BattleState';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { EntityId, GridPosition } from '@domain/shared/types';
import { createEvent } from '@domain/battle/events/BattleEvent';
import { GridSystem } from '@domain/battle/systems/GridSystem';

export class MoveCommand implements Command {
  readonly type = 'MOVE';

  constructor(
    private entityId: EntityId,
    private target: GridPosition,
  ) {}

  execute(state: BattleState): BattleEvent[] {
    const entity = state.entities.get(this.entityId);
    if (!entity || !entity.isAlive) return [];

    const gridSystem = new GridSystem(state.grid);
    const path = gridSystem.findPath(entity.position, this.target, state);

    if (path.length === 0) return [];

    const from = { ...entity.position };
    // Mutation côté state appliquée par le BattleEngine après
    return [
      createEvent({
        type: 'ENTITY_MOVED' as const,
        entityId: this.entityId,
        from,
        to: this.target,
        path,
      }),
    ];
  }
}

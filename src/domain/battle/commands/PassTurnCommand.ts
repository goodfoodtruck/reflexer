import type { Command } from './Command';
import type { BattleState } from '@domain/battle/BattleState';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { EntityId } from '@domain/shared/types';

export class PassTurnCommand implements Command {
  readonly type = 'PASS_TURN';

  constructor(private entityId: EntityId) {}

  execute(_state: BattleState): BattleEvent[] {
    // Passer ne produit aucun event métier, le turn end est géré par la FSM
    return [];
  }
}

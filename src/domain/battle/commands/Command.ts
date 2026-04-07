import type { BattleState } from '@domain/battle/BattleState';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';

/**
 * Command Pattern — chaque action en combat est une commande
 * sérialisable qui produit des events immuables.
 */
export interface Command {
  readonly type: string;
  execute(state: BattleState): BattleEvent[];
}

import type { Command } from './Command';
import type { BattleState } from '@domain/battle/BattleState';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { EntityId, AutomationRule } from '@domain/shared/types';

/**
 * Wrapper autour d'une commande concrète (Move, CastSpell, etc.)
 * générée par l'AutomationSystem. Garde la trace de la règle source
 * pour le debug / replay.
 */
export class AutomationCommand implements Command {
  readonly type = 'AUTOMATION';

  constructor(
    private entityId: EntityId,
    private rule: AutomationRule,
    private innerCommand: Command,
  ) {}

  execute(state: BattleState): BattleEvent[] {
    return this.innerCommand.execute(state);
  }

  getRule(): AutomationRule {
    return this.rule;
  }

  getInnerCommand(): Command {
    return this.innerCommand;
  }
}

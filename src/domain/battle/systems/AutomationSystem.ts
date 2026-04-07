import type { EntityId } from '@domain/shared/types';
import type { BattleState } from '@domain/battle/BattleState';
import type { Command } from '@domain/battle/commands/Command';
import { AutomationCommand } from '@domain/battle/commands/AutomationCommand';
import { ConditionEvaluator } from '@domain/battle/automation/ConditionEvaluator';
import { TargetSelector } from '@domain/battle/automation/TargetSelector';
import { ActionResolver } from '@domain/battle/automation/ActionResolver';

export class AutomationSystem {
  private conditionEvaluator = new ConditionEvaluator();
  private targetSelector = new TargetSelector();
  private actionResolver = new ActionResolver();

  /**
   * Pour une entité donnée, parcourt ses automatismes par priorité
   * et retourne la première Command dont la condition est satisfaite.
   */
  resolveAutomation(
    entityId: EntityId,
    state: BattleState,
  ): Command | null {
    const entity = state.entities.get(entityId);
    if (!entity || !entity.isAlive) return null;

    // Les règles sont déjà triées par priorité dans le component
    for (const rule of entity.automations.rules) {
      // 1. Évaluer les conditions (ConditionBlock[])
      const conditionMet = this.conditionEvaluator.evaluateBlocks(
        rule.conditions,
        entityId,
        state,
      );
      if (!conditionMet) continue;

      // 2. Résoudre la cible
      const target = this.targetSelector.resolve(
        rule.target,
        entityId,
        state,
      );
      if (!target && rule.target.type !== 'SELF') continue;

      // 3. Traduire en Command concrète
      const innerCommand = this.actionResolver.resolve(
        rule.action,
        entityId,
        target,
        state,
      );
      if (!innerCommand) continue;

      // 4. Wrapper dans un AutomationCommand
      return new AutomationCommand(entityId, rule, innerCommand);
    }

    return null;
  }
}

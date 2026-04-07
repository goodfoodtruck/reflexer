import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { BattleState } from '@domain/battle/BattleState';
import type { EntityId } from '@domain/shared/types';
import { StatusEffectType } from '@domain/shared/types';
import { createEvent } from '@domain/battle/events/BattleEvent';

export class StatusSystem {
  /**
   * Tick les effets de statut en début de tour d'une entité.
   * - Poison inflige des dégâts
   * - Regen soigne
   * - Tous les effets perdent 1 tour
   * - Les effets à 0 tours expirent
   */
  tickEffects(entityId: EntityId, state: BattleState): BattleEvent[] {
    const entity = state.entities.get(entityId);
    if (!entity || !entity.isAlive) return [];

    const events: BattleEvent[] = [];

    for (const effect of entity.statusEffects.effects) {
      // Effets périodiques
      if (effect.type === StatusEffectType.Poison) {
        const damage = effect.value;
        const remainingHp = Math.max(0, entity.health.current - damage);
        events.push(
          createEvent({
            type: 'STATUS_TICKED' as const,
            targetId: entityId,
            effect,
            damageOrHeal: -damage,
          }),
        );
        events.push(
          createEvent({
            type: 'DAMAGE_TAKEN' as const,
            targetId: entityId,
            sourceId: effect.sourceId,
            amount: damage,
            remainingHp,
            isCritical: false,
          }),
        );
        if (remainingHp <= 0) {
          events.push(
            createEvent({
              type: 'ENTITY_DIED' as const,
              entityId,
              killerId: effect.sourceId,
            }),
          );
        }
      }

      if (effect.type === StatusEffectType.Regen) {
        const heal = effect.value;
        const remainingHp = Math.min(entity.health.max, entity.health.current + heal);
        events.push(
          createEvent({
            type: 'STATUS_TICKED' as const,
            targetId: entityId,
            effect,
            damageOrHeal: heal,
          }),
        );
        events.push(
          createEvent({
            type: 'HEAL_RECEIVED' as const,
            targetId: entityId,
            sourceId: effect.sourceId,
            amount: heal,
            remainingHp,
          }),
        );
      }

      // Décrémenter durée
      effect.remainingTurns--;

      if (effect.remainingTurns <= 0) {
        events.push(
          createEvent({
            type: 'STATUS_EXPIRED' as const,
            targetId: entityId,
            effect,
          }),
        );
      }
    }

    return events;
  }

  /**
   * Tick les cooldowns des sorts en fin de tour.
   */
  tickCooldowns(entityId: EntityId, state: BattleState): BattleEvent[] {
    const entity = state.entities.get(entityId);
    if (!entity) return [];

    const events: BattleEvent[] = [];
    for (const [spellId, cd] of entity.spells.cooldowns) {
      if (cd > 0) {
        events.push(
          createEvent({
            type: 'COOLDOWN_TICKED' as const,
            entityId,
            spellId,
            remainingCooldown: cd - 1,
          }),
        );
      }
    }

    return events;
  }
}

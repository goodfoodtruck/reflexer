import type { Command } from './Command';
import type { BattleState } from '@domain/battle/BattleState';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';
import type { EntityId, SpellId, GridPosition } from '@domain/shared/types';
import { createEvent } from '@domain/battle/events/BattleEvent';
import { CombatSystem } from '@domain/battle/systems/CombatSystem';
import { GridSystem } from '@domain/battle/systems/GridSystem';

export class CastSpellCommand implements Command {
  readonly type = 'CAST_SPELL';

  constructor(
    private casterId: EntityId,
    private spellId: SpellId,
    private targetPosition: GridPosition,
  ) {}

  execute(state: BattleState): BattleEvent[] {
    const caster = state.entities.get(this.casterId);
    if (!caster || !caster.isAlive) return [];

    const spell = caster.spells.spells.find((s) => s.id === this.spellId);
    if (!spell) return [];

    // Vérifier cooldown
    const cd = caster.spells.cooldowns.get(spell.id) ?? 0;
    if (cd > 0) return [];

    // Vérifier portée
    const gridSystem = new GridSystem(state.grid);
    const distance = gridSystem.manhattanDistance(
      caster.position,
      this.targetPosition,
    );
    if (distance > spell.range) return [];

    // Résoudre les cibles selon le type de sort
    const targetIds = gridSystem.resolveSpellTargets(
      spell,
      this.targetPosition,
      state,
    );
    if (targetIds.length === 0) return [];

    const events: BattleEvent[] = [];

    // Event de cast
    events.push(
      createEvent({
        type: 'SPELL_CAST' as const,
        casterId: this.casterId,
        spellId: this.spellId,
        targetIds,
        targetPosition: this.targetPosition,
      }),
    );

    // Calculer les dégâts pour chaque cible
    const combatSystem = new CombatSystem();
    for (const targetId of targetIds) {
      const target = state.entities.get(targetId);
      if (!target || !target.isAlive) continue;

      const { damage, isCritical } = combatSystem.calculateDamage(
        caster,
        target,
        spell,
      );
      const remainingHp = Math.max(0, target.health.current - damage);

      events.push(
        createEvent({
          type: 'DAMAGE_TAKEN' as const,
          targetId,
          sourceId: this.casterId,
          amount: damage,
          remainingHp,
          isCritical,
        }),
      );

      // Appliquer effet de statut si présent
      if (spell.statusEffect) {
        events.push(
          createEvent({
            type: 'STATUS_APPLIED' as const,
            targetId,
            sourceId: this.casterId,
            effect: {
              ...spell.statusEffect,
              remainingTurns: spell.statusEffect.duration,
              sourceId: this.casterId,
            },
          }),
        );
      }

      // Mort ?
      if (remainingHp <= 0) {
        events.push(
          createEvent({
            type: 'ENTITY_DIED' as const,
            entityId: targetId,
            killerId: this.casterId,
          }),
        );
      }
    }

    return events;
  }
}

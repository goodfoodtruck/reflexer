import type { BattleEntity } from '@domain/battle/components';
import type { SpellDefinition } from '@domain/shared/types';
import { StatusEffectType } from '@domain/shared/types';

export interface DamageResult {
  damage: number;
  isCritical: boolean;
}

export class CombatSystem {
  /**
   * Formule de dégâts :
   *   base = spell.damage + caster.atk * 0.5
   *   reduction = target.def * 0.3
   *   final = max(1, base - reduction) * buffMultiplier
   *   critical = 10% chance, x1.5
   */
  calculateDamage(
    caster: BattleEntity,
    target: BattleEntity,
    spell: SpellDefinition,
  ): DamageResult {
    const atkBuff = this.getStatModifier(caster, StatusEffectType.AttackUp, StatusEffectType.AttackDown);
    const defBuff = this.getStatModifier(target, StatusEffectType.DefenseUp, StatusEffectType.DefenseDown);

    const effectiveAtk = caster.stats.atk * (1 + atkBuff);
    const effectiveDef = target.stats.def * (1 + defBuff);

    const base = spell.damage + effectiveAtk * 0.5;
    const reduction = effectiveDef * 0.3;
    let damage = Math.max(1, Math.floor(base - reduction));

    // Shield absorbe
    const shield = target.statusEffects.effects.find(
      (e) => e.type === StatusEffectType.Shield,
    );
    if (shield) {
      damage = Math.max(0, damage - shield.value);
    }

    // Critical
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    return { damage, isCritical };
  }

  private getStatModifier(
    entity: BattleEntity,
    buffType: StatusEffectType,
    debuffType: StatusEffectType,
  ): number {
    let modifier = 0;
    for (const effect of entity.statusEffects.effects) {
      if (effect.type === buffType) modifier += effect.value / 100;
      if (effect.type === debuffType) modifier -= effect.value / 100;
    }
    return modifier;
  }
}

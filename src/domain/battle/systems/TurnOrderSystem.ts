import type { EntityId } from '@domain/shared/types';
import type { BattleState } from '@domain/battle/BattleState';
import { StatusEffectType } from '@domain/shared/types';
import { getAliveEntities } from '@domain/battle/BattleState';

export class TurnOrderSystem {
  /**
   * Calcule l'ordre de jeu pour le tour.
   * Trié par SPD effective décroissante (buffs/debuffs compris).
   * Les entités stun sont exclues.
   */
  computeTurnOrder(state: BattleState): EntityId[] {
    const alive = getAliveEntities(state);

    return alive
      .filter((e) => {
        // Les entités stun ne jouent pas
        return !e.statusEffects.effects.some(
          (eff) => eff.type === StatusEffectType.Stun,
        );
      })
      .sort((a, b) => {
        const spdA = this.getEffectiveSpeed(a.stats.spd, a.statusEffects.effects);
        const spdB = this.getEffectiveSpeed(b.stats.spd, b.statusEffects.effects);
        if (spdB !== spdA) return spdB - spdA;
        // Tie-break : ID stable
        return a.id.localeCompare(b.id);
      })
      .map((e) => e.id);
  }

  private getEffectiveSpeed(
    baseSpd: number,
    effects: { type: StatusEffectType; value: number }[],
  ): number {
    let modifier = 0;
    for (const eff of effects) {
      if (eff.type === StatusEffectType.SpeedUp) modifier += eff.value / 100;
      if (eff.type === StatusEffectType.SpeedDown) modifier -= eff.value / 100;
    }
    return Math.max(0, Math.floor(baseSpd * (1 + modifier)));
  }
}

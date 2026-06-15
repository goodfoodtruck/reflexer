import { EntityModifier, ExecutionState } from "@fight/fight.types"
import { ModifierPassive } from "@fight/passives/passives.types"
import { DamageComputeProcessor } from "@fight/processors/damage/DamageComputeProcessor"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { makeActionCtx } from "@tests/helpers/makeCtx"
import { describe, expect, it } from "vitest"

describe("Calcul des dégats", () => {

    const ctx = makeActionCtx({ casterId: "player_0", targetId: "enemy_0" })

    const buildModifier = (modifier: EntityModifier, value: number): ModifierPassive => ({
        kind: "MODIFIER",
        id: `mod_${modifier}`,
        config: { duration: "PERMANENT", applicationStrategy: { type: "RESET" } },
        modifier,
        value
    })

    it("applique le damageDealtModifier du caster sur les dégâts", () => {
        const caster = buildPlayingEntity({
            id: "player_0",
            teamId: "PLAYER",
            activePassives: [{ passive: buildModifier("damageDealtModifier", 50), remainingTurns: "PERMANENT", sourceEntityId: "player_0" }]
        })
        const fightContext = buildFightContext([caster], [{}])
        const processor = new DamageComputeProcessor({ initialDamage: 20 })

        const initialExecState: ExecutionState = { computedDamage: 0, computedHeal: 0, computedEnergy: 0 }  // valeur d'entrée
        processor.execute(ctx, initialExecState, fightContext)

        expect(initialExecState.computedDamage).toBe(30)  // 20 * 1.50
    })

    it("ne descend jamais en dessous de zéro", () => {
        const caster = buildPlayingEntity({
            id: "player_0",
            teamId: "PLAYER",
            activePassives: [{ passive: buildModifier("damageDealtModifier", -150), remainingTurns: "PERMANENT", sourceEntityId: "player_0" }]
        })
        const fightContext = buildFightContext([caster], [{}])
        const processor = new DamageComputeProcessor({ initialDamage: 20 })

        const initialExecState: ExecutionState = { computedDamage: 0, computedHeal: 0, computedEnergy: 0 }
        processor.execute(ctx, initialExecState, fightContext)

        expect(initialExecState.computedDamage).toBe(0)
    })

    it("arrondit à l'entier inférieur", () => {
        const caster = buildPlayingEntity({
            id: "player_0",
            teamId: "PLAYER",
            activePassives: [{ passive: buildModifier("damageDealtModifier", 33), remainingTurns: "PERMANENT", sourceEntityId: "player_0" }]
        })
        const fightContext = buildFightContext([caster], [{}])
        const processor = new DamageComputeProcessor({ initialDamage: 10 })

        const initialExecState: ExecutionState = { computedDamage: 0, computedHeal: 0, computedEnergy: 0 }
        processor.execute(ctx, initialExecState, fightContext)

        expect(initialExecState.computedDamage).toBe(13)  // 10 * 1.33 = 13.3 → 13
    })
})
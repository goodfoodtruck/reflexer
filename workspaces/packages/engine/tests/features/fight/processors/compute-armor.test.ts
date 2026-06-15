import { EntityModifier, ExecutionState } from "@fight/fight.types";
import { ModifierPassive } from "@fight/passives/passives.types";
import { ArmorComputeProcessor } from "@fight/processors/armor/ArmorComputeProcessor";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { makeActionCtx } from "@tests/helpers/makeCtx";
import { describe, expect, it } from "vitest";

describe("Calcul de la réduction des dégats", () => {

    const ctx = makeActionCtx({ casterId: "player_0", targetId: "enemy_0" })

    const buildModifier = (modifier: EntityModifier, value: number): ModifierPassive => ({
        kind: "MODIFIER",
        id: `mod_${modifier}`,
        config: { duration: "PERMANENT", applicationStrategy: { type: "RESET" } },
        modifier,
        value
    })

    it("applique le damageReductionModifier de la cible sur les dégâts", () => {
        const target = buildPlayingEntity({
            id: "enemy_0",
            teamId: "ENEMY",
            activePassives: [{ passive: buildModifier("damageReductionModifier", 50), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
        })
        const fightContext = buildFightContext([{}], [target])
        const processor = new ArmorComputeProcessor({})

        const initialExecState: ExecutionState = { computedDamage: 20, computedHeal: 0 }  // valeur d'entrée
        processor.execute(ctx, initialExecState, fightContext)

        expect(initialExecState.computedDamage).toBe(10)  // 20 * 0.5
    })

    it("ne descend jamais en dessous de zéro", () => {
        const target = buildPlayingEntity({
            id: "enemy_0",
            teamId: "ENEMY",
            activePassives: [{ passive: buildModifier("damageReductionModifier", 150), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
        })
        const fightContext = buildFightContext([{}], [target])
        const processor = new ArmorComputeProcessor({})

        const initialExecState: ExecutionState = { computedDamage: 10, computedHeal: 0 }
        processor.execute(ctx, initialExecState, fightContext)

        expect(initialExecState.computedDamage).toBe(0)
    })

    it("augmente les dégâts reçus quand le modificateur est négatif", () => {
        const target = buildPlayingEntity({
            id: "enemy_0",
            teamId: "ENEMY",
            activePassives: [{ passive: buildModifier("damageReductionModifier", -50), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
        })
        const fightContext = buildFightContext([{}], [target])
        const processor = new ArmorComputeProcessor({})

        const initialExecState: ExecutionState = { computedDamage: 10, computedHeal: 0 }
        processor.execute(ctx, initialExecState, fightContext)

        expect(initialExecState.computedDamage).toBe(15)  // 10 * (1 + 0.50) = 15
    })

    describe("arrondi à l'entier le plus proche", () => {

        it("arrondit à l'entier supérieur", () => {
            const target = buildPlayingEntity({
                id: "enemy_0",
                teamId: "ENEMY",
                activePassives: [{ passive: buildModifier("damageReductionModifier", 33), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
            })
            const fightContext = buildFightContext([{}], [target])
            const processor = new ArmorComputeProcessor({})

            const initialExecState: ExecutionState = { computedDamage: 10, computedHeal: 0 }
            processor.execute(ctx, initialExecState, fightContext)

            expect(initialExecState.computedDamage).toBe(7)  // 10 * 0.67 = 6.70 → 7
        })

        it("arrondit à l'entier inférieur", () => {
            const target = buildPlayingEntity({
                id: "enemy_0",
                teamId: "ENEMY",
                activePassives: [{ passive: buildModifier("damageReductionModifier", 26), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
            })
            const fightContext = buildFightContext([{}], [target])
            const processor = new ArmorComputeProcessor({})

            const initialExecState: ExecutionState = { computedDamage: 10, computedHeal: 0 }
            processor.execute(ctx, initialExecState, fightContext)

            expect(initialExecState.computedDamage).toBe(7)  // 10 * 0.74 = 7.40 → 7 
        })
    })
})
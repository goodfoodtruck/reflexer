import { describe, it, expect } from "vitest"
import { DamageProcessor } from "@fight/processors/DamageProcessor"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { ModifierPassive } from "@fight/passives/passives.types"
import { EntityModifier } from "@fight/fight.types"
import { makeActionCtx } from "@tests/helpers/makeCtx"

describe("Calcul des dégâts du DamageProcessor", () => {

    const buildModifier = (modifier: EntityModifier, value: number): ModifierPassive => ({
        kind: "MODIFIER",
        id: `mod_${modifier}`,
        config: { duration: "PERMANENT", applicationStrategy: { type: "RESET" } },
        modifier,
        value
    })

    const ctx = makeActionCtx({ actionId: "strike", casterId: "player_0", targetId: "enemy_0" })

    it("inflige les dégâts de base sans modificateur", () => {
        const fightContext = buildFightContext([{}], [{}])
        const processor = new DamageProcessor(20)

        processor.execute(ctx, fightContext)

        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(80)
    })

    it("augmente les dégâts selon le damageDealtModifier du caster", () => {
        const caster = buildPlayingEntity({
            id: "player_0",
            teamId: "PLAYER",
            activePassives: [{ passive: buildModifier("damageDealtModifier", 50), remainingTurns: "PERMANENT", sourceEntityId: "player_0" }]
        })
        const fightContext = buildFightContext([caster], [{}])
        const processor = new DamageProcessor(20)

        processor.execute(ctx, fightContext)

        // 20 * 1.50 = 30
        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(70)
    })

    it("réduit les dégâts selon le damageReceivedModifier de la cible", () => {
        const target = buildPlayingEntity({
            id: "enemy_0",
            teamId: "ENEMY",
            activePassives: [{ passive: buildModifier("damageReceivedModifier", -25), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
        })
        const fightContext = buildFightContext([{}], [target])
        const processor = new DamageProcessor(20)

        processor.execute(ctx, fightContext)

        // 20 * 0.75 = 15
        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(85)
    })

    it("combine les modificateurs du caster et de la cible", () => {
        const caster = buildPlayingEntity({
            id: "player_0",
            teamId: "PLAYER",
            activePassives: [{ passive: buildModifier("damageDealtModifier", 30), remainingTurns: "PERMANENT", sourceEntityId: "player_0" }]
        })
        const target = buildPlayingEntity({
            id: "enemy_0",
            teamId: "ENEMY",
            activePassives: [{ passive: buildModifier("damageReceivedModifier", -20), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
        })
        const fightContext = buildFightContext([caster], [target])
        const processor = new DamageProcessor(20)

        processor.execute(ctx, fightContext)

        // +30% -20% = +10% net → 20 * 1.10 = 22
        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(78)
    })

    it("ne descend jamais les dégâts en dessous de zéro même avec une réduction supérieure à 100%", () => {
        const target = buildPlayingEntity({
            id: "enemy_0",
            teamId: "ENEMY",
            activePassives: [{ passive: buildModifier("damageReceivedModifier", -150), remainingTurns: "PERMANENT", sourceEntityId: "enemy_0" }]
        })
        const fightContext = buildFightContext([{}], [target])
        const processor = new DamageProcessor(20)

        processor.execute(ctx, fightContext)

        // réduction de 150% → 0 dégâts, pas de soin
        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(100)
    })

    it("arrondit les dégâts à l'entier inférieur", () => {
        const caster = buildPlayingEntity({
            id: "player_0",
            teamId: "PLAYER",
            activePassives: [{ passive: buildModifier("damageDealtModifier", 33), remainingTurns: "PERMANENT", sourceEntityId: "player_0" }]
        })
        const fightContext = buildFightContext([caster], [{}])
        const processor = new DamageProcessor(10)

        processor.execute(ctx, fightContext)

        // 10 * 1.33 = 13.3 → floor → 13
        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(87)
    })

    it("cumule plusieurs modificateurs du même type sur le caster", () => {
        const caster = buildPlayingEntity({
            id: "player_0",
            teamId: "PLAYER",
            activePassives: [
                { passive: buildModifier("damageDealtModifier", 10), remainingTurns: "PERMANENT", sourceEntityId: "player_0" },
                { passive: buildModifier("damageDealtModifier", 20), remainingTurns: "PERMANENT", sourceEntityId: "player_0" }
            ]
        })
        const fightContext = buildFightContext([caster], [{}])
        const processor = new DamageProcessor(20)

        processor.execute(ctx, fightContext)

        // +10% +20% = +30% → 20 * 1.30 = 26
        expect(fightContext.getEntityById("enemy_0")!.currentStats.health).toBe(74)
    })
})
import { describe, it, expect } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder"

describe("Appliquer des dégâts à une entité", () => {

    const buildContextWithTargetHp = (hp: number) => {
        const target = withCurrentStats(
            buildPlayingEntity({ id: "target", teamId: "ENEMY" }),
            { health: hp }
        )
        const source = buildPlayingEntity({ id: "source", teamId: "PLAYER" })
        return buildFightContext([source], [target])
    }

    it("réduit les PV de la cible du montant infligé", () => {
        const context = buildContextWithTargetHp(50)
        
        context.applyDamage({ sourceId: "source", targetId: "target", amount: 20, actionId: "" })

        expect(context.getFightLogs()).toContainEqual(expect.objectContaining({
            type: "damage_dealt",
            targetId: "target",
            amount: 20
        }))
    })

    it("ne descend pas les PV en dessous de zéro même avec un montant excessif", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 999, actionId: "" })

        expect(context.getFightLogs()).toContainEqual(expect.objectContaining({
            type: "damage_dealt",
            targetId: "target",
            amount: 10  // montant réel, pas 999
        }))
    })

    it("marque l'entité comme morte quand ses PV atteignent zéro", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 10, actionId: "" })

        expect(context.getFightLogs()).toContainEqual(expect.objectContaining({
            type: "entity_died",
            entityId: "target"
        }))
    })

    it("marque l'entité comme morte quand les dégâts dépassent ses PV", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 999, actionId: "" })

        expect(context.getFightLogs()).toContainEqual(expect.objectContaining({
            type: "entity_died",
            entityId: "target"
        }))
    })

    it("ne marque pas l'entité comme morte si elle survit aux dégâts", () => {
        const context = buildContextWithTargetHp(50)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 20, actionId: "" })

        expect(context.getFightLogs().some(l => l.type === "entity_died")).toBe(false)
    })

    it("émet un log damage_skipped si la cible est déjà morte", () => {
        const target = buildPlayingEntity({ id: "target", teamId: "ENEMY", isDead: true })
        const source = buildPlayingEntity({ id: "source", teamId: "PLAYER" })
        const context = buildFightContext([source], [target])

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 10, actionId: "" })

        expect(context.getFightLogs()).toContainEqual(expect.objectContaining({
            type: "damage_skipped",
            targetId: "target",
            reason: "target_already_dead"
        }))
    })

    it("ne modifie pas les PV si la cible est déjà morte", () => {
        const target = buildPlayingEntity({ id: "target", teamId: "ENEMY", isDead: true })
        const source = buildPlayingEntity({ id: "source", teamId: "PLAYER" })
        const context = buildFightContext([source], [target])

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 10, actionId: "" })

        expect(context.getEntityById("target")?.currentStats.health).toBe(target.currentStats.health)
    })
})
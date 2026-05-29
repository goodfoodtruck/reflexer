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
        
        context.applyDamage({ sourceId: "source", targetId: "target", amount: 20 })

        expect(context.getEntityById("target")?.currentStats.health).toBe(30)
    })

    it("ne descend pas les PV en dessous de zéro même avec un montant excessif", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 999 })

        expect(context.getEntityById("target")?.currentStats.health).toBe(0)
    })

    it("rapporte le montant réellement infligé, pas le montant demandé", () => {
        const context = buildContextWithTargetHp(10)

        const result = context.applyDamage({ sourceId: "source", targetId: "target", amount: 999 })

        expect(result.actualDamage).toBe(10)
    })

    it("rapporte le montant demandé quand il est inférieur aux PV", () => {
        const context = buildContextWithTargetHp(50)

        const result = context.applyDamage({ sourceId: "source", targetId: "target", amount: 20 })

        expect(result.actualDamage).toBe(20)
    })

    it("marque l'entité comme morte quand ses PV atteignent zéro", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 10 })

        expect(context.getEntityById("target")?.isDead).toBe(true)
    })

    it("marque l'entité comme morte quand les dégâts dépassent ses PV", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 999 })

        expect(context.getEntityById("target")?.isDead).toBe(true)
    })

    it("ne marque pas l'entité comme morte si elle survit aux dégâts", () => {
        const context = buildContextWithTargetHp(50)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 20 })

        expect(context.getEntityById("target")?.isDead).toBe(false)
    })

    it("rapporte isDead: true quand l'entité meurt", () => {
        const context = buildContextWithTargetHp(10)

        const result = context.applyDamage({ sourceId: "source", targetId: "target", amount: 10 })

        expect(result.isDead).toBe(true)
    })

    it("rapporte isDead: false quand l'entité survit", () => {
        const context = buildContextWithTargetHp(50)

        const result = context.applyDamage({ sourceId: "source", targetId: "target", amount: 20 })

        expect(result.isDead).toBe(false)
    })

    it("émet un log damage_dealt avec le montant réellement infligé", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 999 })
        const logs = context.drainLogs()

        expect(logs).toContainEqual(expect.objectContaining({
            type: "damage_dealt",
            sourceId: "source",
            targetId: "target",
            amount: 10
        }))
    })

    it("émet un log entity_died quand l'entité meurt", () => {
        const context = buildContextWithTargetHp(10)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 10 })
        const logs = context.drainLogs()

        expect(logs).toContainEqual(expect.objectContaining({
            type: "entity_died",
            entityId: "target"
        }))
    })

    it("n'émet pas de log entity_died si l'entité survit", () => {
        const context = buildContextWithTargetHp(50)

        context.applyDamage({ sourceId: "source", targetId: "target", amount: 20 })
        const logs = context.drainLogs()

        expect(logs.some(l => l.type === "entity_died")).toBe(false)
    })

    it("lève une erreur si la cible est déjà morte", () => {
        const target = buildPlayingEntity({ id: "target", teamId: "ENEMY", isDead: true })
        const source = buildPlayingEntity({ id: "source", teamId: "PLAYER" })
        const context = buildFightContext([source], [target])

        expect(() => 
            context.applyDamage({ sourceId: "source", targetId: "target", amount: 10 })
        ).toThrow()
    })
})
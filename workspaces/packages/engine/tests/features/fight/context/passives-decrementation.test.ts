import { describe, it, expect } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { PassiveConfig, TriggeredPassive } from "@fight/passives/passives.types"
import { ETargetType } from "@fight/gambits"

describe("Décrémentation des passifs des entités", () => {

        const buildTriggeredPassive = (overrides: Partial<TriggeredPassive & { duration: number | "PERMANENT" }> = {}): PassiveConfig => ({
        kind: "TRIGGERED",
        triggerType: "ON_DAMAGE_RECEIVED",
        triggeredActionId: "any_action",
        targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
        duration: 3,
        ...overrides
    })

    it("décrémente le nombre de tours restants d'un passif", () => {
        const passive = buildTriggeredPassive()
        const entity = buildPlayingEntity({
            id: "player",
            teamId: "PLAYER",
            activePassives: [{ passive, remainingTurns: 3, sourceEntityId: "player" }]
        })
        const context = buildFightContext([entity], [buildPlayingEntity({ teamId: "ENEMY" })])

        context.tickAllPassives()

        const after = context.getEntityById("player")
        expect(after?.activePassives[0]?.remainingTurns).toBe(2)
    })

    it("supprime un passif quand son nombre de tours atteint 0", () => {
        const passive = buildTriggeredPassive()
        const entity = buildPlayingEntity({
            id: "player",
            teamId: "PLAYER",
            activePassives: [{ passive, remainingTurns: 1, sourceEntityId: "player" }]
        })
        const context = buildFightContext([entity], [buildPlayingEntity({ teamId: "ENEMY" })])

        context.tickAllPassives()

        const after = context.getEntityById("player")
        expect(after?.activePassives).toHaveLength(0)
    })

    it("ne décrémente pas un passif permanent", () => {
        const passive = buildTriggeredPassive({ duration: "PERMANENT" })
        const entity = buildPlayingEntity({
            id: "player",
            teamId: "PLAYER",
            activePassives: [{ passive, remainingTurns: "PERMANENT", sourceEntityId: "player" }]
        })
        const context = buildFightContext([entity], [buildPlayingEntity({ teamId: "ENEMY" })])

        context.tickAllPassives()
        context.tickAllPassives()
        context.tickAllPassives()

        const after = context.getEntityById("player")
        expect(after?.activePassives[0]?.remainingTurns).toBe("PERMANENT")
    })

    it("conserve les passifs encore actifs et supprime ceux expirés", () => {
        const passive = buildTriggeredPassive()
        const entity = buildPlayingEntity({
            id: "player",
            teamId: "PLAYER",
            activePassives: [
                { passive, remainingTurns: 1, sourceEntityId: "player" },  // expire
                { passive, remainingTurns: 3, sourceEntityId: "player" },  // continue
                { passive, remainingTurns: "PERMANENT", sourceEntityId: "player" }  // permanent
            ]
        })
        const context = buildFightContext([entity], [buildPlayingEntity({ teamId: "ENEMY" })])

        context.tickAllPassives()

        const after = context.getEntityById("player")
        expect(after?.activePassives).toHaveLength(2)
        expect(after?.activePassives.map(p => p.remainingTurns)).toEqual(
            expect.arrayContaining([2, "PERMANENT"])
        )
    })

    it("décrémente les passifs de toutes les entités vivantes", () => {
        const passive = buildTriggeredPassive()
        const player = buildPlayingEntity({
            id: "player",
            teamId: "PLAYER",
            activePassives: [{ passive, remainingTurns: 3, sourceEntityId: "player" }]
        })
        const enemy = buildPlayingEntity({
            id: "enemy",
            teamId: "ENEMY",
            activePassives: [{ passive, remainingTurns: 2, sourceEntityId: "enemy" }]
        })
        const context = buildFightContext([player], [enemy])

        context.tickAllPassives()

        expect(context.getEntityById("player")?.activePassives[0]?.remainingTurns).toBe(2)
        expect(context.getEntityById("enemy")?.activePassives[0]?.remainingTurns).toBe(1)
    })

    it("ignore les passifs des entités mortes", () => {
        const passive = buildTriggeredPassive()
        const deadEntity = buildPlayingEntity({
            id: "dead",
            teamId: "PLAYER",
            isDead: true,
            activePassives: [{ passive, remainingTurns: 3, sourceEntityId: "dead" }]
        })
        const aliveEntity = buildPlayingEntity({ id: "alive", teamId: "ENEMY" })
        const context = buildFightContext([deadEntity], [aliveEntity])

        context.tickAllPassives()

        const after = context.getEntityById("dead")
        expect(after?.activePassives[0]?.remainingTurns).toBe(3)  // pas décrémenté
    })
})
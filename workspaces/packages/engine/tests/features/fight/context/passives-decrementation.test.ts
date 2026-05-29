import { describe, it, expect } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { ActivePassive, PassiveConfig, TriggeredPassive } from "@fight/passives/passives.types"
import { ETargetType } from "@fight/gambits"
import { PlayingEntityID } from "@fight/fight.types"

describe("Décrémentation des passifs des entités", () => {

    const buildConfig = (duration: number | "PERMANENT" = 3): PassiveConfig => ({
        duration,
        applicationStrategy: { type: "RESET" }
    })

    const buildTriggeredPassive = (overrides: Partial<TriggeredPassive> = {}): TriggeredPassive => ({
        kind: "TRIGGERED",
        id: "any_passive",
        config: buildConfig(),
        triggerType: "damage_dealt",
        triggeredActionId: "any_action",
        targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
        ...overrides
    })

    const buildActivePassive = (
        passive: TriggeredPassive,
        remainingTurns: number | "PERMANENT",
        sourceEntityId: PlayingEntityID
    ): ActivePassive => ({
        passive,
        remainingTurns,
        sourceEntityId
    })

    it("décrémente le nombre de tours restants d'un passif", () => {
        const passive = buildTriggeredPassive()
        const entity = buildPlayingEntity({
            id: "player",
            teamId: "PLAYER",
            activePassives: [buildActivePassive(passive, 3, "player")]
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
            activePassives: [buildActivePassive(passive, 1, "player")]
        })
        const context = buildFightContext([entity], [buildPlayingEntity({ teamId: "ENEMY" })])

        context.tickAllPassives()

        const after = context.getEntityById("player")
        expect(after?.activePassives).toHaveLength(0)
    })

    it("ne décrémente pas un passif permanent", () => {
        const passive = buildTriggeredPassive({ config: buildConfig("PERMANENT") })
        const entity = buildPlayingEntity({
            id: "player",
            teamId: "PLAYER",
            activePassives: [buildActivePassive(passive, "PERMANENT", "player")]
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
                buildActivePassive(passive, 1, "player"),           // expire
                buildActivePassive(passive, 3, "player"),           // continue
                buildActivePassive(passive, "PERMANENT", "player")  // permanent
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
            activePassives: [buildActivePassive(passive, 3, "player")]
        })
        const enemy = buildPlayingEntity({
            id: "enemy",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(passive, 2, "enemy")]
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
            activePassives: [buildActivePassive(passive, 3, "dead")]
        })
        const aliveEntity = buildPlayingEntity({ id: "alive", teamId: "ENEMY" })
        const context = buildFightContext([deadEntity], [aliveEntity])

        context.tickAllPassives()

        const after = context.getEntityById("dead")
        expect(after?.activePassives[0]?.remainingTurns).toBe(3)
    })
})
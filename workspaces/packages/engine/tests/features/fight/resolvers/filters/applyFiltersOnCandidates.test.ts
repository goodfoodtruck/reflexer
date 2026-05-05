import { PlayingEntity } from "@fight/fight.types"
import { AnyFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { buildFilterRegistry } from "@fight/gambits/resolvers/filters/FilterEvaluatorRegistry"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity, withBaseStats, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder"
import { describe, it, expect } from "vitest"

describe("Filtrer une liste d'entités selon des critères", () => {

    const registry = buildFilterRegistry()

    const buildContext = (players: PlayingEntity[], enemies: PlayingEntity[]) =>
        buildFightContext(players, enemies)

    it("retourne toutes les entités si aucun filtre n'est appliqué", () => {
        const enemies = [
            buildPlayingEntity({ id: "enemy_1", teamId: "ENEMY" }),
            buildPlayingEntity({ id: "enemy_2", teamId: "ENEMY" }),
        ]
        const context = buildContext([buildPlayingEntity()], enemies)

        expect(registry.applyAll(enemies, [], context)).toHaveLength(2)
    })

    it("retourne les entités qui matchent avec un seul filtre", () => {
        let weak   = buildPlayingEntity({ id: "weak",   teamId: "ENEMY" })
        let strong = buildPlayingEntity({ id: "strong", teamId: "ENEMY" })
        weak   = withBaseStats(withCurrentStats(weak,   { health: 20 }), { health: 100 })
        strong = withBaseStats(withCurrentStats(strong, { health: 80 }), { health: 100 })

        const context = buildContext([buildPlayingEntity()], [weak, strong])
        const filters: AnyFilter[] = [{ type: "HP_BELOW", threshold: 50 }]

        const result = registry.applyAll([weak, strong], filters, context)

        expect(result).toHaveLength(1)
        expect(result[0]!.id).toBe("weak")
    })

    it("retourne les entités qui matchent avec plusieurs filtres simultanément", () => {
        let poisonedWeak   = buildPlayingEntity({ id: "poisoned_weak",   teamId: "ENEMY" })
        let poisonedStrong = buildPlayingEntity({ id: "poisoned_strong", teamId: "ENEMY" })
        let healthyWeak    = buildPlayingEntity({ id: "healthy_weak",    teamId: "ENEMY" })

        poisonedWeak   = withBaseStats(withCurrentStats({ ...poisonedWeak,   statuses: [{ id: "POISON", stacks: 1, remainingTurns: 2 }] }, { health: 20 }), { health: 100 })
        poisonedStrong = withBaseStats(withCurrentStats({ ...poisonedStrong, statuses: [{ id: "POISON", stacks: 1, remainingTurns: 2 }] }, { health: 80 }), { health: 100 })
        healthyWeak    = withBaseStats(withCurrentStats(healthyWeak, { health: 20 }), { health: 100 })

        const context = buildContext([buildPlayingEntity()], [poisonedWeak, poisonedStrong, healthyWeak])
        const filters: AnyFilter[] = [
            { type: "HP_BELOW",   threshold: 50 },
            { type: "HAS_STATUS", status: { id: "POISON", stacks: 1, remainingTurns: 2 } }
        ]

        const result = registry.applyAll([poisonedWeak, poisonedStrong, healthyWeak], filters, context)        

        expect(result).toHaveLength(1)
        expect(result[0]!.id).toBe("poisoned_weak")
    })

    it("retourne une liste vide si aucune entité ne matche", () => {
        let strong = buildPlayingEntity({ id: "strong", teamId: "ENEMY" })
        strong = withBaseStats(withCurrentStats(strong, { health: 80 }), { health: 100 })

        const context = buildContext([buildPlayingEntity()], [strong])
        const filters: AnyFilter[] = [{ type: "HP_BELOW", threshold: 50 }]

        expect(registry.applyAll([strong], filters, context)).toHaveLength(0)
    })

    it("retourne une liste vide si la liste d'entités est vide", () => {
        const context = buildContext([buildPlayingEntity()], [buildPlayingEntity({ teamId: "ENEMY" })])
        const filters: AnyFilter[] = [{ type: "HP_BELOW", threshold: 50 }]

        expect(registry.applyAll([], filters, context)).toHaveLength(0)
    })
})
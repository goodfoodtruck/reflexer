import { ETargetType } from "@fight/gambits"
import { AnyFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { FilterApplier, buildFilterRegistry } from "@fight/gambits/resolvers/filters/FilterApplier"
import { ActivePassive, TriggeredPassive } from "@fight/passives/passives.types"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity, withBaseStats, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder"
import { describe, it, expect } from "vitest"

describe("Filtrer une liste d'entités selon des critères", () => {

    const registry = buildFilterRegistry()
    const filterApplier = new FilterApplier(registry)

    it("retourne toutes les entités si aucun filtre n'est appliqué", () => {
        const player = buildPlayingEntity()
        const enemies = [
            buildPlayingEntity({ id: "enemy_1", teamId: "ENEMY" }),
            buildPlayingEntity({ id: "enemy_2", teamId: "ENEMY" }),
        ]
        const fightContext = buildFightContext([player], enemies)

        expect(filterApplier.applyAll(enemies, [], { source: player, fightContext })).toHaveLength(2)
    })

    it("retourne les entités qui matchent avec un seul filtre", () => {
        const player = buildPlayingEntity()
        let weak   = buildPlayingEntity({ id: "weak",   teamId: "ENEMY" })
        let strong = buildPlayingEntity({ id: "strong", teamId: "ENEMY" })
        weak   = withBaseStats(withCurrentStats(weak,   { health: 20 }), { health: 100 })
        strong = withBaseStats(withCurrentStats(strong, { health: 80 }), { health: 100 })

        const fightContext = buildFightContext([player], [weak, strong])
        const filters: AnyFilter[] = [{ type: "HP_BELOW", threshold: 50 }]

        const result = filterApplier.applyAll([weak, strong], filters, { source: player, fightContext })

        expect(result).toHaveLength(1)
        expect(result[0]!.id).toBe("weak")
    })

    it("retourne les entités qui matchent avec plusieurs filtres simultanément", () => {
        const player = buildPlayingEntity()
        const poisonPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "POISON",
            config: { duration: 3, applicationStrategy: { type: "RESET" } },
            triggerType: "turn_start",
            triggeredActionId: "poison_tick",
            targetSelector: { context: { targetType: ETargetType.SELF }, sort: "LOWEST_HP" }
        }

        const buildPoisonedActivePassive = (): ActivePassive => ({
            passive: poisonPassive,
            remainingTurns: 2,
            sourceEntityId: "mage"
        })

        let poisonedWeak   = buildPlayingEntity({ id: "poisoned_weak",   teamId: "ENEMY", activePassives: [buildPoisonedActivePassive()] })
        let poisonedStrong = buildPlayingEntity({ id: "poisoned_strong", teamId: "ENEMY", activePassives: [buildPoisonedActivePassive()] })
        let healthyWeak    = buildPlayingEntity({ id: "healthy_weak",    teamId: "ENEMY" })

        poisonedWeak   = withBaseStats(withCurrentStats(poisonedWeak,   { health: 20 }), { health: 100 })
        poisonedStrong = withBaseStats(withCurrentStats(poisonedStrong, { health: 80 }), { health: 100 })
        healthyWeak    = withBaseStats(withCurrentStats(healthyWeak,    { health: 20 }), { health: 100 })

        const fightContext = buildFightContext([player], [poisonedWeak, poisonedStrong, healthyWeak])
        const filters: AnyFilter[] = [
            { type: "HP_BELOW",    threshold: 50 },
            { type: "HAS_PASSIVE", passiveId: "POISON" }
        ]

        const result = filterApplier.applyAll([poisonedWeak, poisonedStrong, healthyWeak], filters, { source: player, fightContext })

        expect(result).toHaveLength(1)
        expect(result[0]!.id).toBe("poisoned_weak")
    })

    it("retourne une liste vide si aucune entité ne matche", () => {
        let strong = buildPlayingEntity({ id: "strong", teamId: "ENEMY" })
        strong = withBaseStats(withCurrentStats(strong, { health: 80 }), { health: 100 })

        const fightContext = buildFightContext([buildPlayingEntity()], [strong])
        const filters: AnyFilter[] = [{ type: "HP_BELOW", threshold: 50 }]

        expect(filterApplier.applyAll([strong], filters, { source: strong, fightContext })).toHaveLength(0)
    })

    it("retourne une liste vide si la liste d'entités est vide", () => {
        const player = buildPlayingEntity()
        const fightContext = buildFightContext([player], [buildPlayingEntity({ teamId: "ENEMY" })])
        const filters: AnyFilter[] = [{ type: "HP_BELOW", threshold: 50 }]

        expect(filterApplier.applyAll([], filters, { source: player, fightContext })).toHaveLength(0)
    })
})
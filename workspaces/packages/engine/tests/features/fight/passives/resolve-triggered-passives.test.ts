import { describe, it, expect } from "vitest"
import { GambitTargetResolver, EntityScopeResolver, FilterApplier, ETargetType } from "@fight/gambits"
import { ConditionResolver } from "@fight/gambits/resolvers/conditions/ConditionResolver"
import { buildFilterRegistry } from "@fight/gambits/resolvers/filters/FilterApplier"
import { ModifierPassive, TriggeredPassive } from "@fight/passives/passives.types"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver"

describe("Les passifs déclenchés retournent les contextes d'exécution correspondants", () => {

    const buildResolver = () => {
        const filterApplier = new FilterApplier(buildFilterRegistry())
        const entityScopeResolver = new EntityScopeResolver()
        const conditionResolver = new ConditionResolver(filterApplier, entityScopeResolver)
        const targetResolver = new GambitTargetResolver(conditionResolver, entityScopeResolver)
        return new TriggeredPassiveResolver(targetResolver)
    }

    const buildTriggeredPassive = (overrides: Partial<TriggeredPassive> = {}): TriggeredPassive => ({
        kind: "TRIGGERED",
        id: "thorns",
        config: { duration: "PERMANENT", applicationStrategy: { type: "RESET" } },
        triggerType: "damage_dealt",
        triggeredActionId: "thorns_retaliation",
        targetSelector: { context: { targetType: ETargetType.ENEMY }, sort: "LOWEST_HP" },
        ...overrides
    })

    it("retourne un ExecutionContext par passif déclenché trouvé", () => {
        const resolver = buildResolver()
        const passive = buildTriggeredPassive()

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 1)

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            casterId: "gobelin",
            targetId: "mage",
            actionId: "thorns_retaliation",
            reactionDepth: 1
        })
    })

    it("retourne plusieurs ExecutionContext si plusieurs passifs correspondent", () => {
        const resolver = buildResolver()
        const thorns = buildTriggeredPassive({ id: "thorns", triggeredActionId: "thorns_retaliation" })
        const rage   = buildTriggeredPassive({ id: "rage",   triggeredActionId: "rage_retaliation" })

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [
                { passive: thorns, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" },
                { passive: rage,   remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }
            ]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 0)

        expect(result).toHaveLength(2)
        expect(result.map(r => r.actionId)).toEqual(expect.arrayContaining(["thorns_retaliation", "rage_retaliation"]))
    })

    it("ignore les passifs qui ne correspondent pas au trigger type", () => {
        const resolver = buildResolver()
        const damageReceived = buildTriggeredPassive({ id: "thorns",    triggerType: "damage_dealt" })
        const onDeath        = buildTriggeredPassive({ id: "explosion", triggerType: "entity_died" })

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [
                { passive: damageReceived, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" },
                { passive: onDeath,        remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }
            ]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 0)

        expect(result).toHaveLength(1)
        expect(result[0]?.actionId).toBe("thorns_retaliation")
    })

    it("retourne un tableau vide si aucun passif ne correspond au trigger type", () => {
        const resolver = buildResolver()
        const passive = buildTriggeredPassive({ triggerType: "entity_died" })

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 0)

        expect(result).toHaveLength(0)
    })

    it("retourne un tableau vide si l'entité n'a aucun passif", () => {
        const resolver = buildResolver()
        const gobelin = buildPlayingEntity({ id: "gobelin", teamId: "ENEMY" })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 0)

        expect(result).toHaveLength(0)
    })

    it("ignore les passifs dont la cible ne peut être résolue", () => {
        const resolver = buildResolver()
        const passive = buildTriggeredPassive({
            targetSelector: { context: { targetType: ETargetType.ALLY }, sort: "LOWEST_HP" }
        })

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 0)

        expect(result).toHaveLength(0)
    })

    it("propage correctement le reactionDepth", () => {
        const resolver = buildResolver()
        const passive = buildTriggeredPassive()

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 5)

        expect(result[0]?.reactionDepth).toBe(5)
    })

    it("ignore les passifs MODIFIER", () => {
        const resolver = buildResolver()
        const modifierPassive: ModifierPassive = {
            kind: "MODIFIER",
            id: "damage_reduction",
            config: { duration: "PERMANENT", applicationStrategy: { type: "RESET" } },
            modifier: "damageReductionModifier",
            value: -20
        }

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive: modifierPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("damage_dealt", gobelin, context, 0)

        expect(result).toHaveLength(0)
    })
})

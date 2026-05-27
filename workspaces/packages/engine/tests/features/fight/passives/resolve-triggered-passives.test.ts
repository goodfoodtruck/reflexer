import { describe, it, expect } from "vitest"
import { GambitTargetResolver, EntityScopeResolver, FilterApplier, FilterEvaluatorRegistry, ETargetType } from "@fight/gambits"
import { PassiveConfig, TriggeredPassive } from "@fight/passives/passives.types"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver"

describe("Les passifs déclenchés retournent les contextes d'exécution correspondants", () => {

    const buildResolver = () => {
        const filterEvaluatorRegistry = new FilterEvaluatorRegistry()
        const filterApplier = new FilterApplier(filterEvaluatorRegistry)
        const entityScopeResolver = new EntityScopeResolver()
        const targetResolver = new GambitTargetResolver(filterApplier, entityScopeResolver)
        return new TriggeredPassiveResolver(targetResolver)
    }

    const buildTriggeredPassive = (overrides: Partial<TriggeredPassive & { duration: number | "PERMANENT" }> = {}): PassiveConfig => ({
        kind: "TRIGGERED",
        triggerType: "ON_DAMAGE_RECEIVED",
        triggeredActionId: "thorns_retaliation",
        targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" },
        duration: "PERMANENT",
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

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 1)

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
        const thorns = buildTriggeredPassive({ triggeredActionId: "thorns_retaliation" })
        const rage = buildTriggeredPassive({ triggeredActionId: "rage_retaliation" })

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

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 0)

        expect(result).toHaveLength(2)
        expect(result.map(r => r.actionId)).toEqual(expect.arrayContaining(["thorns_retaliation", "rage_retaliation"]))
    })

    it("ignore les passifs qui ne correspondent pas au trigger type", () => {
        const resolver = buildResolver()
        const damageReceived = buildTriggeredPassive({ triggerType: "ON_DAMAGE_RECEIVED" })
        const onDeath = buildTriggeredPassive({ triggerType: "ON_DEATH" })

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

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 0)

        expect(result).toHaveLength(1)
        expect(result[0]?.actionId).toBe("thorns_retaliation")
    })

    it("retourne un tableau vide si aucun passif ne correspond au trigger type", () => {
        const resolver = buildResolver()
        const passive = buildTriggeredPassive({ triggerType: "ON_DEATH" })

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 0)

        expect(result).toHaveLength(0)
    })

    it("retourne un tableau vide si l'entité n'a aucun passif", () => {
        const resolver = buildResolver()
        const gobelin = buildPlayingEntity({ id: "gobelin", teamId: "ENEMY" })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 0)

        expect(result).toHaveLength(0)
    })

    it("ignore les passifs dont la cible ne peut être résolue", () => {
        const resolver = buildResolver()
        // passif qui cible un allié — mais le gobelin n'a aucun allié
        const passive = buildTriggeredPassive({
            targetSelector: { context: { targetType: ETargetType.ALLY, filters: [] }, sort: "LOWEST_HP" }
        })

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 0)

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

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 5)

        expect(result[0]?.reactionDepth).toBe(5)
    })

    it("ignore les passifs MODIFIER", () => {
        const resolver = buildResolver()
        const modifierPassive: PassiveConfig = {
            kind: "MODIFIER",
            modifier: "damageReceivedModifier",
            value: -20,
            duration: "PERMANENT"
        }

        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [{ passive: modifierPassive, remainingTurns: "PERMANENT", sourceEntityId: "gobelin" }]
        })
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const context = buildFightContext([mage], [gobelin])

        const result = resolver.resolve("ON_DAMAGE_RECEIVED", gobelin, context, 0)

        expect(result).toHaveLength(0)
    })
})
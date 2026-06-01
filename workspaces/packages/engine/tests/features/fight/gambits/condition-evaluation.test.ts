import { describe, it, expect } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { buildPlayingEntity, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder"
import { ConditionResolver } from "@fight/gambits/resolvers/conditions/ConditionResolver"
import { EntityScopeResolver } from "@fight/gambits/resolvers/EntityScopeResolver"
import { buildFilterRegistry, FilterApplier } from "@fight/gambits/resolvers/filters/FilterApplier"
import { FilterEvaluatorRegistry } from "@fight/gambits/resolvers/filters/FilterEvaluatorRegistry"
import { ETargetType } from "@fight/gambits/gambits.types"
import { buildExistsCondition } from "@tests/builders/fight/gambits/GambitBuilder"

describe("Évaluation des conditions de gambits", () => {

    const buildResolver = () => {
        const registry = buildFilterRegistry()
        const filterApplier = new FilterApplier(registry)
        const entityScopeResolver = new EntityScopeResolver()
        return new ConditionResolver(filterApplier, entityScopeResolver)
    }

    describe("ExistsCondition", () => {

        it("retourne true si au moins une entité du scope correspond aux filtres", () => {
            const resolver = buildResolver()
            const caster = buildPlayingEntity({ id: "caster", teamId: "PLAYER" })
            const enemy  = buildPlayingEntity({ id: "enemy",  teamId: "ENEMY" })
            const context = buildFightContext([caster], [enemy])

            const condition = buildExistsCondition({
                context: { targetType: ETargetType.ENEMY, filters: [] }
            })

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(true)
        })

        it("retourne false si aucune entité du scope ne correspond aux filtres", () => {
            const resolver = buildResolver()
            const caster = buildPlayingEntity({ id: "caster", teamId: "PLAYER" })
            const enemy  = withCurrentStats(buildPlayingEntity({ id: "enemy", teamId: "ENEMY" }), { health: 80 })
            const context = buildFightContext([caster], [enemy])

            const condition = buildExistsCondition({
                context: {
                    targetType: ETargetType.ENEMY,
                    filters: [{ type: "HP_BELOW", threshold: 25 }]
                }
            })

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(false)
        })

        it("retourne false si le scope est vide", () => {
            const resolver = buildResolver()
            const caster = buildPlayingEntity({ id: "caster", teamId: "PLAYER" })
            const context = buildFightContext([caster], [])  // pas d'ennemis

            const condition = buildExistsCondition({
                context: { targetType: ETargetType.ENEMY, filters: [] }
            })

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(false)
        })

        it("retourne true pour SELF si l'entité satisfait les filtres", () => {
            const resolver = buildResolver()
            const caster = withCurrentStats(
                buildPlayingEntity({ id: "caster", teamId: "PLAYER" }),
                { health: 20 }
            )
            const enemy = buildPlayingEntity({ id: "enemy", teamId: "ENEMY" })
            const context = buildFightContext([caster], [enemy])

            const condition = buildExistsCondition({
                context: {
                    targetType: ETargetType.SELF,
                    filters: [{ type: "HP_BELOW", threshold: 50 }]
                }
            })

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(true)
        })
    })

    describe("Opérateur AND", () => {

        it("retourne true si toutes les conditions sont vraies", () => {
            const resolver = buildResolver()
            const caster = withCurrentStats(
                buildPlayingEntity({ id: "caster", teamId: "PLAYER" }),
                { health: 20 }
            )
            const enemy = buildPlayingEntity({ id: "enemy", teamId: "ENEMY" })
            const context = buildFightContext([caster], [enemy])

            const condition = {
                operator: "AND" as const,
                conditions: [
                    buildExistsCondition({ context: { targetType: ETargetType.ENEMY, filters: [] } }),
                    buildExistsCondition({ context: { targetType: ETargetType.SELF, filters: [{ type: "HP_BELOW", threshold: 50 }] } })
                ]
            }

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(true)
        })

        it("retourne false si au moins une condition est fausse", () => {
            const resolver = buildResolver()
            const caster = withCurrentStats(
                buildPlayingEntity({ id: "caster", teamId: "PLAYER" }),
                { health: 80 }
            )
            const enemy = buildPlayingEntity({ id: "enemy", teamId: "ENEMY" })
            const context = buildFightContext([caster], [enemy])

            const condition = {
                operator: "AND" as const,
                conditions: [
                    buildExistsCondition({ context: { targetType: ETargetType.ENEMY, filters: [] } }),
                    buildExistsCondition({ context: { targetType: ETargetType.SELF, filters: [{ type: "HP_BELOW", threshold: 50 }] } })
                ]
            }

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(false)
        })
    })

    describe("Opérateur OR", () => {

        it("retourne true si au moins une condition est vraie", () => {
            const resolver = buildResolver()
            const caster = withCurrentStats(
                buildPlayingEntity({ id: "caster", teamId: "PLAYER" }),
                { health: 80 }
            )
            const enemy = buildPlayingEntity({ id: "enemy", teamId: "ENEMY" })
            const context = buildFightContext([caster], [enemy])

            const condition = {
                operator: "OR" as const,
                conditions: [
                    buildExistsCondition({ context: { targetType: ETargetType.ENEMY, filters: [] } }),         // true
                    buildExistsCondition({ context: { targetType: ETargetType.SELF, filters: [{ type: "HP_BELOW", threshold: 50 }] } })  // false
                ]
            }

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(true)
        })

        it("retourne false si toutes les conditions sont fausses", () => {
            const resolver = buildResolver()
            const caster = withCurrentStats(
                buildPlayingEntity({ id: "caster", teamId: "PLAYER" }),
                { health: 80 }
            )
            const context = buildFightContext([caster], [])  // pas d'ennemis

            const condition = {
                operator: "OR" as const,
                conditions: [
                    buildExistsCondition({ context: { targetType: ETargetType.ENEMY, filters: [] } }),         // false — pas d'ennemis
                    buildExistsCondition({ context: { targetType: ETargetType.SELF, filters: [{ type: "HP_BELOW", threshold: 50 }] } })  // false — HP > 50%
                ]
            }

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(false)
        })
    })

    describe("Opérateur NOT", () => {

        it("retourne true si la condition imbriquée est fausse", () => {
            const resolver = buildResolver()
            const caster = buildPlayingEntity({ id: "caster", teamId: "PLAYER" })
            const context = buildFightContext([caster], [])  // pas d'ennemis

            const condition = {
                operator: "NOT" as const,
                condition: buildExistsCondition({
                    context: { targetType: ETargetType.ENEMY, filters: [] }
                })
            }

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(true)
        })

        it("retourne false si la condition imbriquée est vraie", () => {
            const resolver = buildResolver()
            const caster = buildPlayingEntity({ id: "caster", teamId: "PLAYER" })
            const enemy  = buildPlayingEntity({ id: "enemy",  teamId: "ENEMY" })
            const context = buildFightContext([caster], [enemy])

            const condition = {
                operator: "NOT" as const,
                condition: buildExistsCondition({
                    context: { targetType: ETargetType.ENEMY, filters: [] }
                })
            }

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(false)
        })
    })

    describe("Conditions imbriquées complexes", () => {

        it("évalue correctement AND(EXISTS_ENEMY, OR(HP_BELOW_SELF, EXISTS_ALLY))", () => {
            const resolver = buildResolver()
            const caster = withCurrentStats(
                buildPlayingEntity({ id: "caster", teamId: "PLAYER" }),
                { health: 80 }  // HP > 50% donc HP_BELOW false
            )
            const ally  = buildPlayingEntity({ id: "ally",  teamId: "PLAYER" })
            const enemy = buildPlayingEntity({ id: "enemy", teamId: "ENEMY" })
            const context = buildFightContext([caster, ally], [enemy])

            const condition = {
                operator: "AND" as const,
                conditions: [
                    buildExistsCondition({ context: { targetType: ETargetType.ENEMY, filters: [] } }),  // true
                    {
                        operator: "OR" as const,
                        conditions: [
                            buildExistsCondition({ context: { targetType: ETargetType.SELF, filters: [{ type: "HP_BELOW", threshold: 50 }] } }),  // false
                            buildExistsCondition({ context: { targetType: ETargetType.ALLY, filters: [] } })  // true — ally existe
                        ]
                    }
                ]
            }

            expect(resolver.evaluateConditionGroup(condition, caster, context)).toBe(true)
        })
    })
})
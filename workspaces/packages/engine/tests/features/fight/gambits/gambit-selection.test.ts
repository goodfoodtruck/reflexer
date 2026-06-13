import { describe, expect, it } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { PlayingEntityID } from "@fight/fight.types";
import { buildActionGambit, buildExistsCondition } from "@tests/builders/fight/gambits/GambitBuilder";
import { ETargetType } from "@gambits/gambits.types";
import {isActionGambit} from "@helpers/gambits/typeguards";
import { buildActionGambitResolver } from "@tests/builders/fight/gambits/ActionGambitResolverBuilder";

const CASTER_ID: PlayingEntityID = "caster"
const ENEMY_ID: PlayingEntityID = "enemy_1"

describe("Récupérer les gambits d'action éligibles parmi une liste", () => {

    it("renvoie un candidat si la condition est vraie et qu'une cible existe", () => {
        const resolver = buildActionGambitResolver()

        const fightContext = buildFightContext([
            {
                id: CASTER_ID,
                teamId: "PLAYER",
                gambits: [
                    buildActionGambit({
                        intent: { kind: "ACTION", actionId: "attack_basic" },
                        conditions: buildExistsCondition({
                            context: { targetType: ETargetType.ENEMY, filters: [] }
                        })
                    })
                ]
            },
            { id: ENEMY_ID, teamId: "ENEMY" }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result?.context).toEqual([{
            type: "action",
            casterId: CASTER_ID,
            actionId: "attack_basic",
            targetId: ENEMY_ID,
            reactionDepth: 0
        }])
    });

    it("renvoie les candidats par ordre de priorité (le repli reste dans la liste)", () => {
        const resolver = buildActionGambitResolver()

        const fightContext = buildFightContext([
            {
                id: CASTER_ID,
                teamId: "PLAYER",
                gambits: [
                    buildActionGambit({
                        priority: 1,
                        intent: { kind: "ACTION", actionId: "heavy_attack" },
                        conditions: buildExistsCondition({ context: { targetType: ETargetType.ENEMY, filters: [] } })
                    }),
                    buildActionGambit({
                        priority: 2,
                        intent: { kind: "ACTION", actionId: "attack" },
                        conditions: buildExistsCondition({ context: { targetType: ETargetType.ENEMY, filters: [] } })
                    })
                ]
            },
            { id: ENEMY_ID, teamId: "ENEMY" }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result.map(c => c.actionId)).toEqual(["heavy_attack", "attack"])
    });

    it("renvoie une liste vide si la liste de gambits est vide", () => {
        const resolver = buildActionGambitResolver()

        const fightContext = buildFightContext([
            { id: CASTER_ID, teamId: "PLAYER", gambits: [] },
            { id: ENEMY_ID, teamId: "ENEMY" }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result).toEqual([])
    });

    it("renvoie une liste vide si aucun gambit n'a ses conditions remplies", () => {
        const resolver = buildActionGambitResolver()

        const fightContext = buildFightContext([
            {
                id: CASTER_ID,
                teamId: "PLAYER",
                gambits: [
                    buildActionGambit({
                        conditions: buildExistsCondition({
                            context: {
                                targetType: ETargetType.ENEMY,
                                filters: [{ type: "HP_BELOW", threshold: 5 }]
                            }
                        })
                    })
                ]
            },
            {
                id: ENEMY_ID,
                teamId: "ENEMY",
                currentStats: { health: 100, energy: 10, armor: 0 }
            }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result).toEqual([])
    });

    it("renvoie une liste vide si la condition est valide mais aucune cible ne matche", () => {
        const resolver = buildActionGambitResolver()

        const fightContext = buildFightContext([
            {
                id: CASTER_ID,
                teamId: "PLAYER",
                gambits: [
                    buildActionGambit({
                        conditions: buildExistsCondition({
                            context: { targetType: ETargetType.ENEMY, filters: [] }
                        }),
                        targetSelector: {
                            context: {
                                targetType: ETargetType.ENEMY,
                                filters: [{ type: "HP_BELOW", threshold: 1 }]
                            },
                            sort: "LOWEST_HP"
                        }
                    })
                ]
            },
            {
                id: ENEMY_ID,
                teamId: "ENEMY",
                currentStats: { health: 100, energy: 10, armor: 0 }
            }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result).toEqual([])
    });
})

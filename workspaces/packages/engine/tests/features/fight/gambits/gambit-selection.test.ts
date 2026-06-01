import { describe, expect, it } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { PlayingEntityID } from "@fight/fight.types";
import { buildActionGambit, buildExistsCondition } from "@tests/builders/fight/gambits/GambitBuilder";
import { ETargetType } from "@gambits/gambits.types";
import {isActionGambit} from "@helpers/gambits/typeguards";
import { buildActionGambitResolver } from "@tests/builders/fight/gambits/ActionGambitResolverBuilder";

const CASTER_ID: PlayingEntityID = "caster"
const ENEMY_ID: PlayingEntityID = "enemy_1"

describe("Récupérer un gambit parmi une liste de gambits", () => {

    it("renvoyer un ExecutionContext si la condition est vraie et qu'une cible existe", () => {
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

        expect(result).not.toBeNull()
        expect(result).toEqual({
            type: "action",
            casterId: CASTER_ID,
            actionId: "attack_basic",
            targetId: ENEMY_ID,
            reactionDepth: 0
        })
    });

    it("renvoyer null si la liste de gambits est vide", () => {
        const resolver = buildActionGambitResolver()

        const fightContext = buildFightContext([
            { id: CASTER_ID, teamId: "PLAYER", gambits: [] },
            { id: ENEMY_ID, teamId: "ENEMY" }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result).toBeNull()
    });

    it("renvoyer null si aucun gambit n'a ses conditions remplies", () => {
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
                currentStats: { health: 100, energy: 10 }
            }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result).toBeNull()
    });

    it("renvoyer null si la condition est valide mais aucune cible ne matche", () => {
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
                currentStats: { health: 100, energy: 10 }
            }
        ])

        const caster = fightContext.getEntityById(CASTER_ID)!

        const result = resolver.resolve(caster, caster.gambits.filter(isActionGambit), fightContext)

        expect(result).toBeNull()
    });
})
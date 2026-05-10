import { PlayingEntity } from "@fight/fight.types";
import { HpBelowFilter } from "@fight/gambits/resolvers/filters/entityFilters.types";
import { evaluateHpBelow } from "@fight/gambits/resolvers/filters/evaluators/HpBelowEvaluator";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity, withBaseStats, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Vérifier si l'entité a ses points de vie en dessous d'un certain seuil", () => {

    const buildPlayerWithHp = (current: number, max: number) => {
        let entity = buildPlayingEntity({ id: "player" })
        entity = withBaseStats(entity, { health: max })
        entity = withCurrentStats(entity, { health: current })
        return entity
    }

    const buildContext = (entity: PlayingEntity) => {
        const enemy = buildPlayingEntity({ id: "enemy", teamId: "ENEMY" })
        return buildFightContext([entity], [enemy])
    }

    it("Retourne true si l'entité a en dessous du seuil de HP", () => {
        const hasHpBelowFilter: HpBelowFilter = { type: "HP_BELOW", threshold: 25 }
        const player = buildPlayerWithHp(24, 100)
        const context = buildContext(player)
        
        expect(evaluateHpBelow(player, hasHpBelowFilter, context)).toBe(true)
    })

    it("Retourne false si l'entité a au dessus du seuil de HP", () => {
        const hasHpBelowFilter: HpBelowFilter = { type: "HP_BELOW", threshold: 25 }
        const player = buildPlayerWithHp(32, 100)
        const context = buildContext(player)
        
        expect(evaluateHpBelow(player, hasHpBelowFilter, context)).toBe(false)
    })

    it("Retourne false si l'entité a exactement le seuil de HP", () => {
        const hasHpBelowFilter: HpBelowFilter = { type: "HP_BELOW", threshold: 25 }
        const player = buildPlayerWithHp(25, 100)
        const context = buildContext(player)
        
        expect(evaluateHpBelow(player, hasHpBelowFilter, context)).toBe(false)
    })
})
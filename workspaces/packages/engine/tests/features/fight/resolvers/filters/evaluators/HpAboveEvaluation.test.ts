import { PlayingEntity } from "@fight/fight.types";
import { HpAboveFilter } from "@fight/gambits/resolvers/filters/entityFilters.types";
import { evaluateHpAbove } from "@fight/gambits/resolvers/filters/evaluators/hp/HpAboveEvaluator";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity, withBaseStats, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Vérifier si l'entité a ses points de vie au dessus d'un certain seuil", () => {

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
    
    it("Retourne true si l'entité a au dessus du seuil de HP", () => {
        const hasHpAboveFilter: HpAboveFilter = { type: "HP_ABOVE", threshold: 25 }
        const player = buildPlayerWithHp(26, 100)
        const context = buildContext(player)
        
        expect(evaluateHpAbove(player, hasHpAboveFilter, { source: player, fightContext: context })).toBe(true)
    })

    it("Retourne false si l'entité a en dessous du seuil de HP", () => {
        const hasHpAboveFilter: HpAboveFilter = { type: "HP_ABOVE", threshold: 25 }
        const player = buildPlayerWithHp(24, 100)
        const context = buildContext(player)
        
        expect(evaluateHpAbove(player, hasHpAboveFilter, { source: player, fightContext: context })).toBe(false)
    })

    it("Retourne false si l'entité a exactement le seuil de HP", () => {
        const hasHpAboveFilter: HpAboveFilter = { type: "HP_ABOVE", threshold: 25 }
        const player = buildPlayerWithHp(25, 100)
        const context = buildContext(player)
        
        expect(evaluateHpAbove(player, hasHpAboveFilter, { source: player, fightContext: context })).toBe(false)
    })

    it("Retourne true si l'entité est à pleine vie avec un seuil bas", () => {
        const hasHpAboveFilter: HpAboveFilter = { type: "HP_ABOVE", threshold: 25 }
        const player = buildPlayerWithHp(100, 100)
        const context = buildContext(player)
        
        expect(evaluateHpAbove(player, hasHpAboveFilter, { source: player, fightContext: context })).toBe(true)
    })

    it("Retourne false si l'entité est à 1 HP", () => {
        const hasHpAboveFilter: HpAboveFilter = { type: "HP_ABOVE", threshold: 25 }
        const player = buildPlayerWithHp(1, 100)
        const context = buildContext(player)
        
        expect(evaluateHpAbove(player, hasHpAboveFilter, { source: player, fightContext: context })).toBe(false)
    })
})
import { PlayingEntity } from "@fight/fight.types";
import { FightSafetyChecker } from "@fight/FightSafetyChecker";
import { FightStateResolver } from "@fight/FightStateResolver";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Détecter quand un combat est gagné", () => {
    const safetyChecker = new FightSafetyChecker(0, 0, 0)
    const fightStateResolver = new FightStateResolver(safetyChecker)

    it("Le combat est gagné lorsqu'au moins un allié est en vie et que tous les ennemis sont vaincus", () => {
        const aliveAllies = [buildPlayingEntity({ teamId: "PLAYER" })]
        const aliveEnemies: PlayingEntity[] = []

        expect(fightStateResolver.isFightWon(aliveAllies, aliveEnemies)).toBe(true)
    })

    it("Le combat n'est pas gagné lorsqu'au moins un ennemi est encore en vie", () => {
        const aliveAllies = [buildPlayingEntity({ teamId: "PLAYER" })]
        const aliveEnemies = [buildPlayingEntity({ teamId: "ENEMY" })]

        expect(fightStateResolver.isFightWon(aliveAllies, aliveEnemies)).toBe(false)
    })

    it("Le combat n'est pas gagné si tous les alliés sont morts", () => {
        const aliveAllies: PlayingEntity[] = []
        const aliveEnemies = [buildPlayingEntity({ teamId: "ENEMY" })]

        expect(fightStateResolver.isFightWon(aliveAllies, aliveEnemies)).toBe(false)
    })

    it("Le combat n'est pas gagné si tout le monde est mort", () => {
        const aliveAllies: PlayingEntity[] = []
        const aliveEnemies: PlayingEntity[] = []

        expect(fightStateResolver.isFightWon(aliveAllies, aliveEnemies)).toBe(false)
    })
})
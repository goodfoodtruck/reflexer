import { PlayingEntity } from "@fight/fight.types";
import { FightStateResolver } from "@fight/FightStateResolver";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Déterminer l'état du combat (en cours, gagné, perdu...)", () => {

    const fightStateResolver = new FightStateResolver()
    
    it("Retourne un state 'WON' si le combat est gagné", () => {
        const aliveAllies = [buildPlayingEntity({ teamId: "PLAYER" })]
        const aliveEnemies: PlayingEntity[] = []

        expect(fightStateResolver.resolveEndState(aliveAllies, aliveEnemies)).toEqual("WON")
    })

    it("Retourne un state 'LOST' si le combat est perdu", () => {
        const aliveAllies: PlayingEntity[] = []
        const aliveEnemies: PlayingEntity[] = [buildPlayingEntity({ teamId: "ENEMY" })]

        expect(fightStateResolver.resolveEndState(aliveAllies, aliveEnemies)).toEqual("LOST")
    })

    it("Retourne null si le combat n'est ni gagné ni perdu", () => {
        const aliveAllies = [buildPlayingEntity({ teamId: "PLAYER" })]
        const aliveEnemies = [buildPlayingEntity({ teamId: "ENEMY" })]

        expect(fightStateResolver.resolveEndState(aliveAllies, aliveEnemies)).toEqual(null)
    })
})
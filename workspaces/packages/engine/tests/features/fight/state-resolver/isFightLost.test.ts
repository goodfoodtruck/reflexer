import { PlayingEntity } from "@fight/fight.types";
import { FightStateResolver } from "@fight/FightStateResolver";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Détecter quand un combat est perdu", () => {

    const fightStateResolver = new FightStateResolver()

    it("Le combat est perdu lorsque tous les alliés sont vaincus", () => {
        const aliveAllies: PlayingEntity[] = []
        expect(fightStateResolver.isFightLost(aliveAllies)).toBe(true)
    })

    it("Le combat n'est pas perdu lorsqu'au moins un allié est encore en vie", () => {
        const aliveAllies = [buildPlayingEntity({ id: "player_a", teamId: "PLAYER" })]
        expect(fightStateResolver.isFightLost(aliveAllies)).toBe(false)
    })
})
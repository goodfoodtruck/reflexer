import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Construire l'ordre d'initiative des entités joueuses", () => {

    it("Alterne les entités joueur et ennemi dans l'ordre d'initiative", () => {
        const playerEntities = [buildPlayingEntity({ id: "player_1", teamId: 'PLAYER' })]
        const enemyEntities = [buildPlayingEntity({ id: "enemy_1", teamId: 'ENEMY' })]

        const context = buildFightContext(playerEntities, enemyEntities)

        expect(context.getInitiativeOrder()).toEqual(["player_1", "enemy_1"])
    })

    it("Continue d'alterner quand une équipe a plus d'entités que l'autre", () => {
        const playerEntities = [
            buildPlayingEntity({ id: "player_1", teamId: 'PLAYER' }),
            buildPlayingEntity({ id: "player_2", teamId: 'PLAYER' }),
        ]
        const enemyEntities = [buildPlayingEntity({ id: "enemy_1", teamId: 'ENEMY' })]

        const context = buildFightContext(playerEntities, enemyEntities)

        expect(context.getInitiativeOrder()).toEqual(["player_1", "enemy_1", "player_2"])
    })

    it("Place les ennemis supplémentaires à la fin quand ils sont plus nombreux", () => {
        const playerEntities = [
            buildPlayingEntity({ id: "player_1", teamId: 'PLAYER' }),
            buildPlayingEntity({ id: "player_2", teamId: 'PLAYER' })
        ]
        const enemyEntities = [
            buildPlayingEntity({ id: "enemy_1", teamId: 'ENEMY' }),
            buildPlayingEntity({ id: "enemy_2", teamId: 'ENEMY' }),
            buildPlayingEntity({ id: "enemy_3", teamId: 'ENEMY' })
        ]

        const context = buildFightContext(playerEntities, enemyEntities)

        expect(context.getInitiativeOrder()).toEqual(["player_1", "enemy_1", "player_2", "enemy_2", "enemy_3"])
    })
})
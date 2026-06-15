import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Récupérer les alliés ou ennemis d'une entité", () => {

    describe("Récupérer les alliés", () => {

        it("retourne les autres entités de la même équipe", () => {
            const player1 = buildPlayingEntity({ id: "player_1", teamId: "PLAYER" })
            const player2 = buildPlayingEntity({ id: "player_2", teamId: "PLAYER" })
            const enemy   = buildPlayingEntity({ id: "enemy",    teamId: "ENEMY" })
            const context = buildFightContext([player1, player2], [enemy])

            const allies = context.getAllies(player1)

            expect(allies).toHaveLength(1)
            expect(allies[0]?.id).toBe("player_2")
        })

        it("exclut l'entité elle-même de ses alliés", () => {
            const player = buildPlayingEntity({ id: "player_1", teamId: "PLAYER" })
            const enemy  = buildPlayingEntity({ id: "enemy",    teamId: "ENEMY" })
            const context = buildFightContext([player], [enemy])

            const allies = context.getAllies(player)

            expect(allies).toHaveLength(0)
        })

        it("ignore les alliés morts", () => {
            const player1 = buildPlayingEntity({ id: "player_1", teamId: "PLAYER" })
            const player2 = buildPlayingEntity({ id: "player_2", teamId: "PLAYER", isDead: true })
            const enemy   = buildPlayingEntity({ id: "enemy",    teamId: "ENEMY" })
            const context = buildFightContext([player1, player2], [enemy])

            const allies = context.getAllies(player1)

            expect(allies).toHaveLength(0)
        })

        it("retourne tous les alliés vivants quand il y en a plusieurs", () => {
            const player1 = buildPlayingEntity({ id: "player_1", teamId: "PLAYER" })
            const player2 = buildPlayingEntity({ id: "player_2", teamId: "PLAYER" })
            const player3 = buildPlayingEntity({ id: "player_3", teamId: "PLAYER" })
            const enemy   = buildPlayingEntity({ id: "enemy",    teamId: "ENEMY" })
            const context = buildFightContext([player1, player2, player3], [enemy])

            const allies = context.getAllies(player1)

            expect(allies).toHaveLength(2)
            expect(allies.map(a => a.id)).toEqual(expect.arrayContaining(["player_2", "player_3"]))
        })
    })

    describe("Récupérer les ennemis", () => {

        it("retourne les entités de l'équipe adverse", () => {
            const player = buildPlayingEntity({ id: "player", teamId: "PLAYER" })
            const enemy1 = buildPlayingEntity({ id: "enemy_1", teamId: "ENEMY" })
            const enemy2 = buildPlayingEntity({ id: "enemy_2", teamId: "ENEMY" })
            const context = buildFightContext([player], [enemy1, enemy2])

            const enemies = context.getEnemies(player)

            expect(enemies).toHaveLength(2)
            expect(enemies.map(e => e.id)).toEqual(expect.arrayContaining(["enemy_1", "enemy_2"]))
        })

        it("retourne une liste vide si aucun ennemi vivant", () => {
            const player = buildPlayingEntity({ id: "player", teamId: "PLAYER" })
            const enemy  = buildPlayingEntity({ id: "enemy",  teamId: "ENEMY", isDead: true })
            const context = buildFightContext([player], [enemy])

            const enemies = context.getEnemies(player)

            expect(enemies).toHaveLength(0)
        })

        it("ignore les ennemis morts", () => {
            const player  = buildPlayingEntity({ id: "player",  teamId: "PLAYER" })
            const enemy1  = buildPlayingEntity({ id: "enemy_1", teamId: "ENEMY" })
            const enemy2  = buildPlayingEntity({ id: "enemy_2", teamId: "ENEMY", isDead: true })
            const context = buildFightContext([player], [enemy1, enemy2])

            const enemies = context.getEnemies(player)

            expect(enemies).toHaveLength(1)
            expect(enemies[0]?.id).toBe("enemy_1")
        })

        it("fonctionne correctement depuis le point de vue d'un ennemi", () => {
            const player = buildPlayingEntity({ id: "player", teamId: "PLAYER" })
            const enemy  = buildPlayingEntity({ id: "enemy",  teamId: "ENEMY" })
            const context = buildFightContext([player], [enemy])

            const enemiesFromEnemyPov = context.getEnemies(enemy)

            expect(enemiesFromEnemyPov).toHaveLength(1)
            expect(enemiesFromEnemyPov[0]?.id).toBe("player")
        })
    })
})

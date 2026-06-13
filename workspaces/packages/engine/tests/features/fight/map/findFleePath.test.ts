import { describe, expect, it } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { EObstacleType } from "@fight/map/fight.map.types"
import { manhattanDistance } from "@helpers/map/utils"
import { isAdjacent } from "@helpers/map/utils"
import { MovementContext } from "@fight/fight.types"

const fleeContext = (casterId: string, targetPosition: { x: number; y: number }): MovementContext =>
    ({ casterId, targetPosition, strategy: "FLEE" })

describe("FightMap.findFleePath", () => {

    it("s'éloigne de la menace jusqu'à la case la plus lointaine atteignable", () => {
        const fightContext = buildFightContext(
            [{ id: "player_0", position: { x: 1, y: 1 } }],
            [{ id: "enemy_0", position: { x: 0, y: 0 } }],
            { dimensions: { width: 3, height: 3 } }
        )

        const path = fightContext.getMap().findFleePath({
            context: fleeContext("player_0", { x: 0, y: 0 }),
            fightContext
        })

        // Coin diagonalement opposé à la menace = case la plus éloignée.
        expect(path.at(-1)).toEqual({ x: 2, y: 2 })
    })

    it("ne renvoie que des pas adjacents et praticables", () => {
        const fightContext = buildFightContext(
            [{ id: "player_0", position: { x: 1, y: 4 } }],
            [{ id: "enemy_0", position: { x: 8, y: 4 } }]
        )

        const start = { x: 1, y: 4 }
        const path = fightContext.getMap().findFleePath({
            context: fleeContext("player_0", { x: 8, y: 4 }),
            fightContext
        })

        const cells = [start, ...path]
        for (let i = 1; i < cells.length; i++) {
            expect(isAdjacent(cells[i - 1], cells[i])).toBe(true)
            expect(fightContext.getMap().isWalkable(cells[i])).toBe(true)
        }
        // La destination est strictement plus loin de la menace que le départ.
        expect(manhattanDistance(path.at(-1)!, { x: 8, y: 4 })).toBeGreaterThan(
            manhattanDistance(start, { x: 8, y: 4 })
        )
    })

    it("contourne un mur sans jamais le traverser", () => {
        // Mur vertical en x=1 sauf une ouverture en (1,2) : pour fuir vers la
        // droite, le seul passage est l'ouverture.
        const fightContext = buildFightContext(
            [{ id: "player_0", position: { x: 0, y: 2 } }],
            [{ id: "enemy_0", position: { x: 0, y: 0 } }],
            {
                dimensions: { width: 3, height: 3 },
                cells: [
                    [EObstacleType.FLOOR, EObstacleType.WALL,  EObstacleType.FLOOR],
                    [EObstacleType.FLOOR, EObstacleType.WALL,  EObstacleType.FLOOR],
                    [EObstacleType.FLOOR, EObstacleType.FLOOR, EObstacleType.FLOOR],
                ]
            }
        )

        const path = fightContext.getMap().findFleePath({
            context: fleeContext("player_0", { x: 0, y: 0 }),
            fightContext
        })

        // Aucune case du chemin n'est un mur, et il passe par l'ouverture (1,2).
        for (const cell of path) {
            expect(fightContext.getMap().isWalkable(cell)).toBe(true)
        }
        expect(path).toContainEqual({ x: 1, y: 2 })
    })

    it("renvoie un chemin vide si l'entité est déjà la plus éloignée possible", () => {
        const fightContext = buildFightContext(
            [{ id: "player_0", position: { x: 2, y: 2 } }],
            [{ id: "enemy_0", position: { x: 0, y: 0 } }],
            { dimensions: { width: 3, height: 3 } }
        )

        const path = fightContext.getMap().findFleePath({
            context: fleeContext("player_0", { x: 0, y: 0 }),
            fightContext
        })

        expect(path).toEqual([])
    })
})

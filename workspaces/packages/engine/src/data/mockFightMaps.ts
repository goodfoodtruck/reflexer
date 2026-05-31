import { EFightMapSize, EObstacleType, FightMapConfig } from "@fight/map/fight.map.types"

const W = 10
const H = 10

/** Grille pleine de sol, sur laquelle on pose ensuite quelques obstacles. */
function floorGrid(width: number, height: number): EObstacleType[][] {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, () => EObstacleType.FLOOR)
    )
}

function withObstacles(
    cells: EObstacleType[][],
    obstacles: { x: number; y: number; type: EObstacleType }[]
): EObstacleType[][] {
    for (const { x, y, type } of obstacles) {
        cells[y]![x] = type
    }
    return cells
}

const TRAINING_GROUND: FightMapConfig = {
    id: "TRAINING_GROUND",
    size: EFightMapSize.LONG_RANGE,
    dimensions: { width: W, height: H },
    cells: withObstacles(floorGrid(W, H), [
        { x: 4, y: 2, type: EObstacleType.WALL },
        { x: 5, y: 2, type: EObstacleType.WALL },
        { x: 4, y: 7, type: EObstacleType.HOLE },
        { x: 5, y: 7, type: EObstacleType.HOLE },
    ]),
    spawnPoints: {
        player: [{ x: 1, y: 4 }, { x: 1, y: 6 }],
        enemy: [{ x: 8, y: 4 }, { x: 8, y: 6 }],
    },
}

/**
 * Cartes de combat mockées (en attendant une vraie source persistée). Sert de
 * seed à `InMemoryFightMapRegistry`, côté moteur comme côté front pour le rendu.
 */
export const MOCK_FIGHT_MAPS: readonly FightMapConfig[] = [TRAINING_GROUND]

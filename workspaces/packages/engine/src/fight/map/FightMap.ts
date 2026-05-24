import {Dimensions, Position} from "@helpers/types/helpers.types"
import { MapCell, FightMapConfig, EObstacleType } from "@fight/map/fight.map.types"

export class FightMap {
    private cells: MapCell[][]
    private dimensions: Dimensions

    constructor(config: FightMapConfig) {
        this.dimensions = config.dimensions
        this.cells = config.cells.map((row, y) =>
            row.map((cell, x) => ({ type: cell, position: { x, y } }))
        )
    }

    isWalkable(position: Position): boolean {
        const cell = this.cells[position.y]?.[position.x];
        return cell?.type === EObstacleType.FLOOR
    }
}
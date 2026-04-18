import { FightMapConfig, MapCell } from "@fight/fight.types"
import { Dimensions } from "@helpers/types/helpers.types"

export class FightMap {
    private cells: MapCell[][]
    private dimensions: Dimensions

    constructor(config: FightMapConfig) {
        this.dimensions = config.dimensions
        this.cells = config.cells.map((row, y) =>
            row.map((cell, x) => ({ ...cell, position: { x, y } }))
        )
    }
}
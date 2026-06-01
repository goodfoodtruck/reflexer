import { AreaType } from "@fight/fight.types"
import { Position } from "@helpers/types/helpers.types"

export const isInArea = (
        center: Position, 
        pos: Position, 
        areaSize: number, 
        areaType: AreaType
    ): boolean => {
        const dx = Math.abs(pos.x - center.x)
        const dy = Math.abs(pos.y - center.y)

        switch (areaType.kind) {
            case "CIRCLE": return dx + dy <= areaSize  // distance de Manhattan
            case "SQUARE": return dx <= areaSize && dy <= areaSize
            case "CROSS":  return (dx === 0 || dy === 0) && dx + dy <= areaSize
        }
}

export const getCellsInArea = (
        centerPosition: Position,
        areaSize: number,
        areaType: AreaType,
    ): Position[] => {
        const cells: Position[] = []

        for (let x = centerPosition.x - areaSize; x <= centerPosition.x + areaSize; x++) {
            for (let y = centerPosition.y - areaSize; y <= centerPosition.y + areaSize; y++) {
                const pos: Position = { x, y }

                if (isInArea(centerPosition, pos, areaSize, areaType)) {
                    cells.push(pos)
                }
            }
        }

        return cells
    }
import { Position } from "@helpers/types/helpers.types";

export function isAdjacent(from: Position, to: Position): boolean {
    const dx = Math.abs(from.x - to.x)
    const dy = Math.abs(from.y - to.y)
    return dx + dy === 1
}
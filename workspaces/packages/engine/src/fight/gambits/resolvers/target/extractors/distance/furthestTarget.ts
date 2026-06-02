import { PlayingEntity } from "@fight/fight.types"
import { Position } from "@helpers/types/helpers.types"

export const getFurthestTarget = (
    sourceEntity: Readonly<PlayingEntity>, 
    entities: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (! entities.length) throw new Error("Cannot get furthest entity from empty list")

    return [...entities].sort((a, b) =>
        manhattanDistance(sourceEntity.position, a.position) - manhattanDistance(sourceEntity.position, b.position)
    ).pop()!
}

const manhattanDistance = (a: Position, b: Position): number => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}
import { PlayingEntity } from "@fight/fight.types"
import { manhattanDistance } from "@helpers/map/utils"

export const getFurthestTarget = (
    sourceEntity: Readonly<PlayingEntity>, 
    entities: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (! entities.length) throw new Error("Cannot get furthest entity from empty list")

    return [...entities].sort((a, b) =>
        manhattanDistance(sourceEntity.position, a.position) - manhattanDistance(sourceEntity.position, b.position)
    ).pop()!
}
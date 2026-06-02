import { PlayingEntity } from "@fight/fight.types"
import { manhattanDistance } from "@helpers/map/utils"

export const getNearestTarget = (
    sourceEntity: Readonly<PlayingEntity>, 
    entities: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (! entities.length) throw new Error("Cannot get nearest entity from empty list")

    return [...entities].sort((a, b) =>
        manhattanDistance(sourceEntity.position, a.position) - manhattanDistance(sourceEntity.position, b.position)
    ).shift()!
}

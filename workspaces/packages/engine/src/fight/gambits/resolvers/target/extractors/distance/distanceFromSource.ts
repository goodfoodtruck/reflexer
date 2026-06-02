import { PlayingEntity } from "@fight/fight.types"
import { manhattanDistance } from "@helpers/map/utils"

const sortByDistance = (
    source: Readonly<PlayingEntity>,
    entities: Readonly<PlayingEntity[]>
): PlayingEntity[] => {
    return [...entities].sort((a, b) =>
        manhattanDistance(source.position, a.position) - manhattanDistance(source.position, b.position)
    )
}

export const getNearestTarget = (
    source: Readonly<PlayingEntity>,
    entities: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (! entities.length) throw new Error("Cannot get nearest entity from empty list")
    return sortByDistance(source, entities).shift()!
}

export const getFurthestTarget = (
    source: Readonly<PlayingEntity>,
    entities: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (! entities.length) throw new Error("Cannot get furthest entity from empty list")
    return sortByDistance(source, entities).pop()!
}
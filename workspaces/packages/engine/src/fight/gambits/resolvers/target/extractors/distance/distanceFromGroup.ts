import { PlayingEntity } from "@fight/fight.types"
import { manhattanDistance } from "@helpers/map/utils"

const sortByMinDistanceFromGroup = (
    candidates: Readonly<PlayingEntity[]>,
    referenceGroup: Readonly<PlayingEntity[]>
): PlayingEntity[] => {
    return [...candidates].sort((a, b) => {
        const minDistA = Math.min(...referenceGroup.map(ref => manhattanDistance(a.position, ref.position)))
        const minDistB = Math.min(...referenceGroup.map(ref => manhattanDistance(b.position, ref.position)))
        return minDistA - minDistB
    })
}

/**
 * Retourne le candidat dont la distance minimale vers un membre du groupe est la plus petite.
 */
export const getNearestFromGroup = (
    candidates: Readonly<PlayingEntity[]>,
    referenceGroup: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (!candidates.length) throw new Error("Cannot get nearest from empty candidates list")
    if (!referenceGroup.length) throw new Error("Cannot get nearest from empty reference group")
    return sortByMinDistanceFromGroup(candidates, referenceGroup)[0]!
}

/**
 * Retourne le candidat dont la distance minimale vers un membre du groupe est la plus grande.
 */
export const getFurthestFromGroup = (
    candidates: Readonly<PlayingEntity[]>,
    referenceGroup: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (!candidates.length) throw new Error("Cannot get furthest from empty candidates list")
    if (!referenceGroup.length) throw new Error("Cannot get furthest from empty reference group")
    return sortByMinDistanceFromGroup(candidates, referenceGroup).at(-1)!
}
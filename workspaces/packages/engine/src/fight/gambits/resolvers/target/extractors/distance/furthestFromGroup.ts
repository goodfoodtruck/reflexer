import { PlayingEntity } from "@fight/fight.types"
import { manhattanDistance } from "@helpers/map/utils"

/**
 * Pour chaque candidat, calcule la distance maximale vers n'importe quelle 
 * entité du groupe de référence, puis retourne le candidat avec la plus 
 * grande distance maximale.
 */
export const getFurthestFromGroup = (
    candidates: Readonly<PlayingEntity[]>,
    referenceGroup: Readonly<PlayingEntity[]>
): PlayingEntity => {
    if (! candidates.length) throw new Error("Cannot get furthest from empty candidates list")
    if (! referenceGroup.length) throw new Error("Cannot get furthest from empty reference group")

    return [...candidates].sort((a, b) => {
        const minDistA = Math.min(...referenceGroup.map(ref => manhattanDistance(a.position, ref.position)))
        const minDistB = Math.min(...referenceGroup.map(ref => manhattanDistance(b.position, ref.position)))
        return minDistA - minDistB
    }).pop()!
}
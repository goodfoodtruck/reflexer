import { Position } from "@helpers/types/helpers.types"

/**
 * Trace une ligne droite entre deux positions sur une grille 2D
 * et retourne toutes les cases traversées, dans l'ordre du départ à l'arrivée.
 * 
 * Utilise l'algorithme de Bresenham pour déterminer quelles cases
 * sont traversées par le segment reliant les deux positions.
 * 
 * @param from - Position de départ
 * @param to - Position d'arrivée
 * @returns Les cases traversées dans l'ordre, incluant départ et arrivée
 */
export function bresenhamLine(from: Position, to: Position): Position[] {
    const traversedCells: Position[] = []

    let currentX = from.x
    let currentY = from.y

    const totalStepsX = Math.abs(to.x - from.x)
    const totalStepsY = Math.abs(to.y - from.y)

    // direction du déplacement sur chaque axe : +1 ou -1
    const stepDirectionX = from.x < to.x ? 1 : -1
    const stepDirectionY = from.y < to.y ? 1 : -1

    // l'erreur accumulée détermine quand on avance sur l'axe secondaire
    // positive → on avance en X, négative → on avance en Y
    let accumulatedError = totalStepsX - totalStepsY

    while (true) {
        traversedCells.push({ x: currentX, y: currentY })

        if (currentX === to.x && currentY === to.y) break

        const doubledError = 2 * accumulatedError

        // si l'erreur penche vers X, on avance d'un pas en X
        if (doubledError > -totalStepsY) {
            accumulatedError -= totalStepsY
            currentX += stepDirectionX
        }

        // si l'erreur penche vers Y, on avance d'un pas en Y
        if (doubledError < totalStepsX) {
            accumulatedError += totalStepsX
            currentY += stepDirectionY
        }
    }

    return traversedCells
}
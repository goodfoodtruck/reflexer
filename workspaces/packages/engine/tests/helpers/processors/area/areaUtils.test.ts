import { describe, it, expect } from "vitest"
import { Position } from "@helpers/types/helpers.types"
import { getCellsInArea } from "@helpers/processors/area/areaUtils"

describe("Calculer les cases dans une zone", () => {

    const center: Position = { x: 2, y: 2 }

    describe("CIRCLE", () => {

        it("retourne uniquement la case centrale pour une taille de 0", () => {
            const cells = getCellsInArea(center, 0, { kind: "CIRCLE" })
            expect(cells).toHaveLength(1)
            expect(cells).toContainEqual({ x: 2, y: 2 })
        })

        it("retourne les cases à distance de Manhattan <= areaSize", () => {
            const cells = getCellsInArea(center, 1, { kind: "CIRCLE" })
            expect(cells).toHaveLength(5)
            expect(cells).toEqual(expect.arrayContaining([
                { x: 2, y: 2 },  // centre
                { x: 1, y: 2 },  // gauche
                { x: 3, y: 2 },  // droite
                { x: 2, y: 1 },  // haut
                { x: 2, y: 3 },  // bas
            ]))
        })

        it("n'inclut pas les cases en diagonale directe pour taille 1", () => {
            const cells = getCellsInArea(center, 1, { kind: "CIRCLE" })
            expect(cells).not.toContainEqual({ x: 1, y: 1 })
            expect(cells).not.toContainEqual({ x: 3, y: 3 })
        })

        it("retourne 13 cases pour une taille de 2", () => {
            const cells = getCellsInArea(center, 2, { kind: "CIRCLE" })
            expect(cells).toHaveLength(13)
        })
    })

    describe("SQUARE", () => {

        it("retourne uniquement la case centrale pour une taille de 0", () => {
            const cells = getCellsInArea(center, 0, { kind: "SQUARE" })
            expect(cells).toHaveLength(1)
            expect(cells).toContainEqual({ x: 2, y: 2 })
        })

        it("retourne 9 cases pour une taille de 1", () => {
            const cells = getCellsInArea(center, 1, { kind: "SQUARE" })
            expect(cells).toHaveLength(9)
        })

        it("inclut les cases en diagonale", () => {
            const cells = getCellsInArea(center, 1, { kind: "SQUARE" })
            expect(cells).toContainEqual({ x: 1, y: 1 })
            expect(cells).toContainEqual({ x: 3, y: 3 })
            expect(cells).toContainEqual({ x: 1, y: 3 })
            expect(cells).toContainEqual({ x: 3, y: 1 })
        })

        it("retourne 25 cases pour une taille de 2", () => {
            const cells = getCellsInArea(center, 2, { kind: "SQUARE" })
            expect(cells).toHaveLength(25)
        })
    })

    describe("CROSS", () => {

        it("retourne uniquement la case centrale pour une taille de 0", () => {
            const cells = getCellsInArea(center, 0, { kind: "CROSS" })
            expect(cells).toHaveLength(1)
            expect(cells).toContainEqual({ x: 2, y: 2 })
        })

        it("retourne 5 cases pour une taille de 1", () => {
            const cells = getCellsInArea(center, 1, { kind: "CROSS" })
            expect(cells).toHaveLength(5)
            expect(cells).toEqual(expect.arrayContaining([
                { x: 2, y: 2 },
                { x: 1, y: 2 },
                { x: 3, y: 2 },
                { x: 2, y: 1 },
                { x: 2, y: 3 },
            ]))
        })

        it("n'inclut pas les cases en diagonale", () => {
            const cells = getCellsInArea(center, 2, { kind: "CROSS" })
            expect(cells).not.toContainEqual({ x: 1, y: 1 })
            expect(cells).not.toContainEqual({ x: 3, y: 3 })
        })

        it("retourne 9 cases pour une taille de 2", () => {
            const cells = getCellsInArea(center, 2, { kind: "CROSS" })
            expect(cells).toHaveLength(9)
            expect(cells).toEqual(expect.arrayContaining([
                { x: 2, y: 2 },
                { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
                { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 3 }, { x: 2, y: 4 },
            ]))
        })
    })

    describe("Cas limites", () => {

        it("fonctionne correctement avec un centre en (0, 0)", () => {
            const cells = getCellsInArea({ x: 0, y: 0 }, 1, { kind: "CIRCLE" })
            expect(cells).toHaveLength(5)
            expect(cells).toContainEqual({ x: 0, y: 0 })
        })

        it("peut produire des cases avec des coordonnées négatives", () => {
            const cells = getCellsInArea({ x: 0, y: 0 }, 1, { kind: "SQUARE" })
            expect(cells).toContainEqual({ x: -1, y: -1 })
        })
    })
})
import { describe, it, expect } from "vitest"
import { bresenhamLine } from "@helpers/map/lineOfSight"

describe("Tracer une ligne entre deux positions sur une grille", () => {

    describe("Lignes horizontales et verticales", () => {

        it("trace une ligne horizontale vers la droite", () => {
            const result = bresenhamLine({ x: 0, y: 0 }, { x: 4, y: 0 })

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
                { x: 4, y: 0 }
            ])
        })

        it("trace une ligne horizontale vers la gauche", () => {
            const result = bresenhamLine({ x: 4, y: 0 }, { x: 0, y: 0 })

            expect(result).toEqual([
                { x: 4, y: 0 },
                { x: 3, y: 0 },
                { x: 2, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: 0 }
            ])
        })

        it("trace une ligne verticale vers le bas", () => {
            const result = bresenhamLine({ x: 0, y: 0 }, { x: 0, y: 4 })

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                { x: 0, y: 3 },
                { x: 0, y: 4 }
            ])
        })

        it("trace une ligne verticale vers le haut", () => {
            const result = bresenhamLine({ x: 0, y: 4 }, { x: 0, y: 0 })

            expect(result).toEqual([
                { x: 0, y: 4 },
                { x: 0, y: 3 },
                { x: 0, y: 2 },
                { x: 0, y: 1 },
                { x: 0, y: 0 }
            ])
        })
    })

    describe("Diagonales parfaites", () => {

        it("trace une diagonale à 45° vers le bas-droite", () => {
            const result = bresenhamLine({ x: 0, y: 0 }, { x: 3, y: 3 })

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 3 }
            ])
        })

        it("trace une diagonale à 45° vers le haut-gauche", () => {
            const result = bresenhamLine({ x: 3, y: 3 }, { x: 0, y: 0 })

            expect(result).toEqual([
                { x: 3, y: 3 },
                { x: 2, y: 2 },
                { x: 1, y: 1 },
                { x: 0, y: 0 }
            ])
        })

        it("trace une diagonale vers le haut-droite", () => {
            const result = bresenhamLine({ x: 0, y: 3 }, { x: 3, y: 0 })

            expect(result).toEqual([
                { x: 0, y: 3 },
                { x: 1, y: 2 },
                { x: 2, y: 1 },
                { x: 3, y: 0 }
            ])
        })
    })

    describe("Lignes avec pente non triviale", () => {

        it("trace une ligne avec pente douce (plus large que haute)", () => {
            const result = bresenhamLine({ x: 0, y: 0 }, { x: 5, y: 2 })

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 2, y: 1 },
                { x: 3, y: 1 },
                { x: 4, y: 2 },
                { x: 5, y: 2 }
            ])
        })

        it("trace une ligne avec pente forte (plus haute que large)", () => {
            const result = bresenhamLine({ x: 0, y: 0 }, { x: 2, y: 5 })

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 2, y: 4 },
                { x: 2, y: 5 }
            ])
        })
    })

    describe("Cas limites", () => {

        it("retourne une seule case quand départ et arrivée sont identiques", () => {
            const result = bresenhamLine({ x: 3, y: 3 }, { x: 3, y: 3 })

            expect(result).toEqual([{ x: 3, y: 3 }])
        })

        it("retourne deux cases pour des positions adjacentes", () => {
            const result = bresenhamLine({ x: 0, y: 0 }, { x: 1, y: 0 })

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 1, y: 0 }
            ])
        })

        it("fonctionne avec des coordonnées négatives", () => {
            const result = bresenhamLine({ x: -2, y: -1 }, { x: 2, y: 1 })

            expect(result).toHaveLength(5)
            expect(result[0]).toEqual({ x: -2, y: -1 })
            expect(result.at(-1)).toEqual({ x: 2, y: 1 })
        })

        it("inclut toujours la case de départ en premier et la case d'arrivée en dernier", () => {
            const from = { x: 1, y: 7 }
            const to = { x: 8, y: 3 }
            const result = bresenhamLine(from, to)

            expect(result[0]).toEqual(from)
            expect(result.at(-1)).toEqual(to)
        })
    })

    describe("Symétrie et cohérence", () => {

        it("produit le même nombre de cases dans les deux sens", () => {
            const forward = bresenhamLine({ x: 0, y: 0 }, { x: 5, y: 2 })
            const backward = bresenhamLine({ x: 5, y: 2 }, { x: 0, y: 0 })

            expect(forward).toHaveLength(backward.length)
        })

        it("traverse les mêmes cases dans les deux sens", () => {
            const forward = bresenhamLine({ x: 0, y: 0 }, { x: 5, y: 2 })
            const backward = bresenhamLine({ x: 5, y: 2 }, { x: 0, y: 0 })

            const forwardSet = forward.map(p => `${p.x},${p.y}`).sort()
            const backwardSet = backward.map(p => `${p.x},${p.y}`).sort()

            expect(forwardSet).toEqual(backwardSet)
        })

        it("ne produit que des cases adjacentes ou diagonales entre elles", () => {
            const result = bresenhamLine({ x: 0, y: 0 }, { x: 7, y: 3 })

            for (let i = 1; i < result.length; i++) {
                const prev = result[i - 1]!
                const curr = result[i]!
                const dx = Math.abs(curr.x - prev.x)
                const dy = Math.abs(curr.y - prev.y)

                // chaque pas est au maximum d'une case en X et une en Y
                expect(dx).toBeLessThanOrEqual(1)
                expect(dy).toBeLessThanOrEqual(1)
                // au moins un axe avance
                expect(dx + dy).toBeGreaterThanOrEqual(1)
            }
        })
    })
})
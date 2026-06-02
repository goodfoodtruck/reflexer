import { describe, it, expect } from "vitest"
import { getNearestTarget } from "@fight/gambits/resolvers/target/extractors/distance/nearestTarget"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"

describe("Récupérer l'entité la plus proche", () => {

    it("retourne l'entité la plus proche en distance de Manhattan", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const close  = buildPlayingEntity({ id: "close",  position: { x: 1, y: 0 } })  // distance 1
        const far    = buildPlayingEntity({ id: "far",    position: { x: 3, y: 3 } })  // distance 6

        const result = getNearestTarget(source, [far, close])

        expect(result.id).toBe("close")
    })

    it("retourne l'entité la plus proche parmi plusieurs candidats", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 5, y: 5 } })
        const a = buildPlayingEntity({ id: "a", position: { x: 3, y: 5 } })  // distance 2
        const b = buildPlayingEntity({ id: "b", position: { x: 5, y: 3 } })  // distance 2
        const c = buildPlayingEntity({ id: "c", position: { x: 0, y: 0 } })  // distance 10

        const result = getNearestTarget(source, [c, a, b])

        expect(["a", "b"]).toContain(result.id)  // les deux sont à distance 2
    })

    it("retourne la seule entité si la liste n'en contient qu'une", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const only   = buildPlayingEntity({ id: "only",   position: { x: 10, y: 10 } })

        const result = getNearestTarget(source, [only])

        expect(result.id).toBe("only")
    })

    it("retourne l'entité sur la même case si elle existe", () => {
        const source   = buildPlayingEntity({ id: "source",   position: { x: 3, y: 3 } })
        const sameCell = buildPlayingEntity({ id: "sameCell", position: { x: 3, y: 3 } })  // distance 0
        const other    = buildPlayingEntity({ id: "other",    position: { x: 4, y: 3 } })  // distance 1

        const result = getNearestTarget(source, [other, sameCell])

        expect(result.id).toBe("sameCell")
    })

    it("gère correctement les distances en diagonale", () => {
        const source   = buildPlayingEntity({ id: "source",   position: { x: 0, y: 0 } })
        const diagonal = buildPlayingEntity({ id: "diagonal", position: { x: 1, y: 1 } })  // Manhattan = 2
        const straight = buildPlayingEntity({ id: "straight", position: { x: 2, y: 0 } })  // Manhattan = 2

        const result = getNearestTarget(source, [diagonal, straight])

        // les deux sont à distance 2 en Manhattan
        expect(["diagonal", "straight"]).toContain(result.id)
    })

    it("préfère une entité en ligne droite à une en diagonale si elle est plus proche", () => {
        const source   = buildPlayingEntity({ id: "source",   position: { x: 0, y: 0 } })
        const adjacent = buildPlayingEntity({ id: "adjacent", position: { x: 1, y: 0 } })  // Manhattan = 1
        const diagonal = buildPlayingEntity({ id: "diagonal", position: { x: 1, y: 1 } })  // Manhattan = 2

        const result = getNearestTarget(source, [diagonal, adjacent])

        expect(result.id).toBe("adjacent")
    })

    it("fonctionne avec des coordonnées négatives", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const neg    = buildPlayingEntity({ id: "neg",    position: { x: -1, y: -1 } })  // Manhattan = 2
        const pos    = buildPlayingEntity({ id: "pos",    position: { x: 3, y: 0 } })    // Manhattan = 3

        const result = getNearestTarget(source, [pos, neg])

        expect(result.id).toBe("neg")
    })

    it("ne modifie pas le tableau original", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const a = buildPlayingEntity({ id: "a", position: { x: 3, y: 0 } })
        const b = buildPlayingEntity({ id: "b", position: { x: 1, y: 0 } })
        const original = [a, b]

        getNearestTarget(source, original)

        expect(original[0]!.id).toBe("a")  // pas réordonné
        expect(original[1]!.id).toBe("b")
    })

    it("lève une erreur si la liste est vide", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })

        expect(() => getNearestTarget(source, [])).toThrow("Cannot get nearest entity from empty list")
    })
})
import { describe, it, expect } from "vitest"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { getFurthestTarget } from "@fight/gambits/resolvers/target/extractors/distance/distanceFromSource"

describe("Récupérer l'entité la plus éloignée", () => {

    it("retourne l'entité la plus éloignée en distance de Manhattan", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const close  = buildPlayingEntity({ id: "close",  position: { x: 1, y: 0 } })  // distance 1
        const far    = buildPlayingEntity({ id: "far",    position: { x: 3, y: 3 } })  // distance 6

        const result = getFurthestTarget(source, [close, far])

        expect(result.id).toBe("far")
    })

    it("retourne l'entité la plus éloignée parmi plusieurs candidats", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const a = buildPlayingEntity({ id: "a", position: { x: 1, y: 0 } })  // distance 1
        const b = buildPlayingEntity({ id: "b", position: { x: 3, y: 3 } })  // distance 6
        const c = buildPlayingEntity({ id: "c", position: { x: 2, y: 1 } })  // distance 3

        const result = getFurthestTarget(source, [a, c, b])

        expect(result.id).toBe("b")
    })

    it("retourne la seule entité si la liste n'en contient qu'une", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const only   = buildPlayingEntity({ id: "only",   position: { x: 1, y: 0 } })

        const result = getFurthestTarget(source, [only])

        expect(result.id).toBe("only")
    })

    it("gère correctement l'égalité de distance", () => {
        const source   = buildPlayingEntity({ id: "source",   position: { x: 0, y: 0 } })
        const diagonal = buildPlayingEntity({ id: "diagonal", position: { x: 1, y: 1 } })  // distance 2
        const straight = buildPlayingEntity({ id: "straight", position: { x: 2, y: 0 } })  // distance 2

        const result = getFurthestTarget(source, [diagonal, straight])

        expect(["diagonal", "straight"]).toContain(result.id)
    })

    it("ne retourne pas une entité sur la même case s'il y en a de plus éloignées", () => {
        const source   = buildPlayingEntity({ id: "source",   position: { x: 3, y: 3 } })
        const sameCell = buildPlayingEntity({ id: "sameCell", position: { x: 3, y: 3 } })  // distance 0
        const far      = buildPlayingEntity({ id: "far",      position: { x: 0, y: 0 } })  // distance 6

        const result = getFurthestTarget(source, [sameCell, far])

        expect(result.id).toBe("far")
    })

    it("fonctionne avec des coordonnées négatives", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const neg    = buildPlayingEntity({ id: "neg",    position: { x: -5, y: -5 } })  // distance 10
        const pos    = buildPlayingEntity({ id: "pos",    position: { x: 3, y: 0 } })    // distance 3

        const result = getFurthestTarget(source, [pos, neg])

        expect(result.id).toBe("neg")
    })

    it("ne modifie pas le tableau original", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })
        const a = buildPlayingEntity({ id: "a", position: { x: 1, y: 0 } })
        const b = buildPlayingEntity({ id: "b", position: { x: 3, y: 0 } })
        const original = [a, b]

        getFurthestTarget(source, original)

        expect(original[0]!.id).toBe("a")
        expect(original[1]!.id).toBe("b")
    })

    it("lève une erreur si la liste est vide", () => {
        const source = buildPlayingEntity({ id: "source", position: { x: 0, y: 0 } })

        expect(() => getFurthestTarget(source, [])).toThrow()
    })
})
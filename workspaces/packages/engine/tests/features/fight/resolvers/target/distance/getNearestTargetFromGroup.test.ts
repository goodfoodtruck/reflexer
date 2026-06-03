import { describe, it, expect } from "vitest"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { getNearestFromGroup } from "@fight/gambits/resolvers/target/extractors/distance/distanceFromGroup"

describe("Récupérer l'entité la plus proche d'un groupe", () => {

    it("retourne le candidat le plus proche d'une entité du groupe", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 5, y: 5 } })

        const candidateClose = buildPlayingEntity({ id: "close", position: { x: 4, y: 5 } })  // distance 1 de l'allié
        const candidateFar   = buildPlayingEntity({ id: "far",   position: { x: 0, y: 0 } })  // distance 10 de l'allié

        const result = getNearestFromGroup([candidateFar, candidateClose], [ally])

        expect(result.id).toBe("close")
    })

    it("considère la distance minimale vers n'importe quel membre du groupe", () => {
        const ally1 = buildPlayingEntity({ id: "ally1", position: { x: 0, y: 0 } })
        const ally2 = buildPlayingEntity({ id: "ally2", position: { x: 10, y: 10 } })

        // candidateA est loin de ally1 (distance 8) mais proche de ally2 (distance 2)
        const candidateA = buildPlayingEntity({ id: "a", position: { x: 9, y: 9 } })
        // candidateB est proche de ally1 (distance 3) mais loin de ally2 (distance 17)
        const candidateB = buildPlayingEntity({ id: "b", position: { x: 2, y: 1 } })

        const result = getNearestFromGroup([candidateA, candidateB], [ally1, ally2])

        // candidateA: min(8, 2) = 2 — candidateB: min(3, 17) = 3
        expect(result.id).toBe("a")
    })

    it("gère l'égalité de distance minimale", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 5, y: 5 } })

        const a = buildPlayingEntity({ id: "a", position: { x: 4, y: 5 } })  // distance 1
        const b = buildPlayingEntity({ id: "b", position: { x: 5, y: 4 } })  // distance 1

        const result = getNearestFromGroup([a, b], [ally])

        expect(["a", "b"]).toContain(result.id)
    })

    it("retourne le seul candidat s'il n'y en a qu'un", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 0, y: 0 } })
        const only = buildPlayingEntity({ id: "only", position: { x: 10, y: 10 } })

        const result = getNearestFromGroup([only], [ally])

        expect(result.id).toBe("only")
    })

    it("ne modifie pas le tableau de candidats", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 0, y: 0 } })
        const a = buildPlayingEntity({ id: "a", position: { x: 5, y: 0 } })
        const b = buildPlayingEntity({ id: "b", position: { x: 1, y: 0 } })
        const original = [a, b]

        getNearestFromGroup(original, [ally])

        expect(original[0]!.id).toBe("a")
        expect(original[1]!.id).toBe("b")
    })

    it("lève une erreur si la liste de candidats est vide", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 0, y: 0 } })

        expect(() => getNearestFromGroup([], [ally])).toThrow("Cannot get nearest from empty candidates list")
    })

    it("lève une erreur si le groupe de référence est vide", () => {
        const candidate = buildPlayingEntity({ id: "candidate", position: { x: 0, y: 0 } })

        expect(() => getNearestFromGroup([candidate], [])).toThrow("Cannot get nearest from empty reference group")
    })
})
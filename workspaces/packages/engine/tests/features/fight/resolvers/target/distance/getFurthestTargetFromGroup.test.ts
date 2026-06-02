import { describe, it, expect } from "vitest"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { getFurthestFromGroup } from "@fight/gambits/resolvers/target/extractors/distance/furthestFromGroup"

describe("Récupérer l'entité la plus éloignée d'un groupe", () => {

    it("retourne le candidat le plus éloigné de toutes les entités du groupe", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 0, y: 0 } })

        const candidateClose = buildPlayingEntity({ id: "close", position: { x: 1, y: 0 } })  // distance 1
        const candidateFar   = buildPlayingEntity({ id: "far",   position: { x: 5, y: 5 } })  // distance 10

        const result = getFurthestFromGroup([candidateClose, candidateFar], [ally])

        expect(result.id).toBe("far")
    })

    it("considère la distance minimale vers le membre le plus proche du groupe", () => {
        const ally1 = buildPlayingEntity({ id: "ally1", position: { x: 0, y: 0 } })
        const ally2 = buildPlayingEntity({ id: "ally2", position: { x: 10, y: 10 } })

        // candidateA: min(distance ally1=18, distance ally2=2) = 2
        const candidateA = buildPlayingEntity({ id: "a", position: { x: 9, y: 9 } })
        // candidateB: min(distance ally1=3, distance ally2=17) = 3
        const candidateB = buildPlayingEntity({ id: "b", position: { x: 2, y: 1 } })

        const result = getFurthestFromGroup([candidateA, candidateB], [ally1, ally2])

        // candidateB a la plus grande distance minimale (3 > 2)
        expect(result.id).toBe("b")
    })

    it("gère l'égalité de distance", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 5, y: 5 } })

        const a = buildPlayingEntity({ id: "a", position: { x: 4, y: 5 } })  // distance 1
        const b = buildPlayingEntity({ id: "b", position: { x: 5, y: 4 } })  // distance 1

        const result = getFurthestFromGroup([a, b], [ally])

        expect(["a", "b"]).toContain(result.id)
    })

    it("retourne le seul candidat s'il n'y en a qu'un", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 0, y: 0 } })
        const only = buildPlayingEntity({ id: "only", position: { x: 1, y: 0 } })

        const result = getFurthestFromGroup([only], [ally])

        expect(result.id).toBe("only")
    })

    it("préfère un candidat éloigné de tous les membres du groupe", () => {
        const ally1 = buildPlayingEntity({ id: "ally1", position: { x: 0, y: 0 } })
        const ally2 = buildPlayingEntity({ id: "ally2", position: { x: 2, y: 0 } })

        // candidateA: min(distance ally1=1, distance ally2=1) = 1
        const candidateA = buildPlayingEntity({ id: "a", position: { x: 1, y: 0 } })
        // candidateB: min(distance ally1=10, distance ally2=8) = 8
        const candidateB = buildPlayingEntity({ id: "b", position: { x: 10, y: 0 } })

        const result = getFurthestFromGroup([candidateA, candidateB], [ally1, ally2])

        expect(result.id).toBe("b")
    })

    it("ne modifie pas le tableau de candidats", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 0, y: 0 } })
        const a = buildPlayingEntity({ id: "a", position: { x: 1, y: 0 } })
        const b = buildPlayingEntity({ id: "b", position: { x: 5, y: 0 } })
        const original = [a, b]

        getFurthestFromGroup(original, [ally])

        expect(original[0]!.id).toBe("a")
        expect(original[1]!.id).toBe("b")
    })

    it("lève une erreur si la liste de candidats est vide", () => {
        const ally = buildPlayingEntity({ id: "ally", position: { x: 0, y: 0 } })

        expect(() => getFurthestFromGroup([], [ally])).toThrow("Cannot get furthest from empty candidates list")
    })

    it("lève une erreur si le groupe de référence est vide", () => {
        const candidate = buildPlayingEntity({ id: "candidate", position: { x: 0, y: 0 } })

        expect(() => getFurthestFromGroup([candidate], [])).toThrow("Cannot get furthest from empty reference group")
    })
})
import { describe, it, expect } from "vitest"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { getFurthestFromGroup } from "@fight/gambits/resolvers/target/extractors/distance/distanceFromGroup"

describe("Récupérer l'entité la plus éloignée d'un groupe", () => {

    it("retourne le candidat le plus éloigné de toutes les entités du groupe", () => {
        const character = buildPlayingEntity({ id: "character", position: { x: 0, y: 0 } })

        const candidateClose = buildPlayingEntity({ id: "close", position: { x: 1, y: 0 } })  // distance 1
        const candidateFar   = buildPlayingEntity({ id: "far",   position: { x: 5, y: 5 } })  // distance 10

        const result = getFurthestFromGroup([candidateClose, candidateFar], [character])

        expect(result.id).toBe("far")
    })

    it("considère la distance minimale vers le membre le plus proche du groupe", () => {
        const character1 = buildPlayingEntity({ id: "character1", position: { x: 0, y: 0 } })
        const character2 = buildPlayingEntity({ id: "character2", position: { x: 10, y: 10 } })

        // candidateA: min(distance character1=18, distance character2=2) = 2
        const candidateA = buildPlayingEntity({ id: "a", position: { x: 9, y: 9 } })
        // candidateB: min(distance character1=3, distance character2=17) = 3
        const candidateB = buildPlayingEntity({ id: "b", position: { x: 2, y: 1 } })

        const result = getFurthestFromGroup([candidateA, candidateB], [character1, character2])

        // candidateB a la plus grande distance minimale (3 > 2)
        expect(result.id).toBe("b")
    })

    it("gère l'égalité de distance", () => {
        const character = buildPlayingEntity({ id: "character", position: { x: 5, y: 5 } })

        const a = buildPlayingEntity({ id: "a", position: { x: 4, y: 5 } })  // distance 1
        const b = buildPlayingEntity({ id: "b", position: { x: 5, y: 4 } })  // distance 1

        const result = getFurthestFromGroup([a, b], [character])

        expect(["a", "b"]).toContain(result.id)
    })

    it("retourne le seul candidat s'il n'y en a qu'un", () => {
        const character = buildPlayingEntity({ id: "character", position: { x: 0, y: 0 } })
        const only = buildPlayingEntity({ id: "only", position: { x: 1, y: 0 } })

        const result = getFurthestFromGroup([only], [character])

        expect(result.id).toBe("only")
    })

    it("préfère un candidat éloigné de tous les membres du groupe", () => {
        const character1 = buildPlayingEntity({ id: "character1", position: { x: 0, y: 0 } })
        const character2 = buildPlayingEntity({ id: "character2", position: { x: 2, y: 0 } })

        // candidateA: min(distance character1=1, distance character2=1) = 1
        const candidateA = buildPlayingEntity({ id: "a", position: { x: 1, y: 0 } })
        // candidateB: min(distance character1=10, distance character2=8) = 8
        const candidateB = buildPlayingEntity({ id: "b", position: { x: 10, y: 0 } })

        const result = getFurthestFromGroup([candidateA, candidateB], [character1, character2])

        expect(result.id).toBe("b")
    })

    it("ne modifie pas le tableau de candidats", () => {
        const character = buildPlayingEntity({ id: "character", position: { x: 0, y: 0 } })
        const a = buildPlayingEntity({ id: "a", position: { x: 1, y: 0 } })
        const b = buildPlayingEntity({ id: "b", position: { x: 5, y: 0 } })
        const original = [a, b]

        getFurthestFromGroup(original, [character])

        expect(original[0]!.id).toBe("a")
        expect(original[1]!.id).toBe("b")
    })

    it("lève une erreur si la liste de candidats est vide", () => {
        const character = buildPlayingEntity({ id: "character", position: { x: 0, y: 0 } })

        expect(() => getFurthestFromGroup([], [character])).toThrow("Cannot get furthest from empty candidates list")
    })

    it("lève une erreur si le groupe de référence est vide", () => {
        const candidate = buildPlayingEntity({ id: "candidate", position: { x: 0, y: 0 } })

        expect(() => getFurthestFromGroup([candidate], [])).toThrow("Cannot get furthest from empty reference group")
    })
})
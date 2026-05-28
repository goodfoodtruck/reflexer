import { describe, it, expect } from "vitest"
import { FightSafetyChecker } from "@fight/FightSafetyChecker"

describe("Détection d'un combat bloqué", () => {

    const buildChecker = () => new FightSafetyChecker(10, 3, 3)

    it("déclare le combat bloqué quand le nombre max de tours est atteint", () => {
        const checker = buildChecker()
        const logs = Array(10).fill("turn_unique")

        expect(checker.isFightStuck(logs)).toBe(true)
    })

    it("ne déclare pas le combat bloqué en dessous du nombre max de tours sans cycle", () => {
        const checker = buildChecker()
        const logs = ["A", "B", "C", "D", "E"]

        expect(checker.isFightStuck(logs)).toBe(false)
    })

    it("détecte un cycle d'un seul tour répété", () => {
        const checker = buildChecker()
        const logs = ["X", "A", "A", "A"]

        expect(checker.isFightStuck(logs)).toBe(true)
    })

    it("détecte un cycle de deux tours alternés", () => {
        const checker = buildChecker()
        const logs = ["A", "B", "A", "B", "A", "B"]

        expect(checker.isFightStuck(logs)).toBe(true)
    })

    it("détecte un cycle de trois tours répété", () => {
        const checker = buildChecker()
        const logs = ["A", "B", "C", "A", "B", "C", "A", "B", "C"]

        expect(checker.isFightStuck(logs)).toBe(true)
    })

    it("ne détecte pas de cycle si le motif ne se répète pas assez de fois", () => {
        const checker = buildChecker()
        const logs = ["A", "B", "A", "B"]

        expect(checker.isFightStuck(logs)).toBe(false)
    })

    it("ne détecte pas de cycle si le combat progresse", () => {
        const checker = buildChecker()
        const logs = ["A", "B", "A", "B", "A", "C"]

        expect(checker.isFightStuck(logs)).toBe(false)
    })

    it("ne détecte pas de cycle avec trop peu de tours", () => {
        const checker = buildChecker()
        const logs = ["A", "B"]

        expect(checker.isFightStuck(logs)).toBe(false)
    })

    it("détecte un cycle même quand il est précédé de tours non répétés", () => {
        const checker = buildChecker()
        const logs = ["X", "Y", "Z", "A", "B", "A", "B", "A", "B"]

        expect(checker.isFightStuck(logs)).toBe(true)
    })
})
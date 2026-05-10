import { getHighestHpTarget } from "@fight/gambits/resolvers/target/extractors/highestHPTarget"
import { buildPlayingEntity, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder"
import { describe, it, expect } from "vitest"

describe("Récupérer la cible avec le plus de HP parmi une liste d'entités", () => {

    it("lève une erreur si la liste d'entités est vide", () => {
        expect(() => getHighestHpTarget([])).toThrow()
    })

    it("retourne l'unique entité si la liste n'en contient qu'une", () => {
        const entity = buildPlayingEntity()
        expect(getHighestHpTarget([entity])).toBe(entity)
    })

    it("retourne l'entité avec le plus de HP", () => {
        const weak   = withCurrentStats(buildPlayingEntity({ id: "weak" }),   { health: 10 })
        const strong = withCurrentStats(buildPlayingEntity({ id: "strong" }), { health: 80 })
        const mid    = withCurrentStats(buildPlayingEntity({ id: "mid" }),    { health: 40 })

        expect(getHighestHpTarget([weak, strong, mid]).id).toBe("strong")
    })

    it("retourne le premier trouvé si deux entités ont le même nombre de HP", () => {
        const entityA = withCurrentStats(buildPlayingEntity({ id: "a" }),   { health: 50 })
        const entityB = withCurrentStats(buildPlayingEntity({ id: "b" }), { health: 50 })

        const result = getHighestHpTarget([entityA, entityB])
        expect(["a", "b"]).toContain(result.id)
    })
})
import { getLowestArmorTarget } from "@fight/gambits/resolvers/target/extractors/armor/lowestArmorTarget"
import { buildPlayingEntity, withCurrentStats } from "@tests/builders/fight/PlayingEntityBuilder"
import { describe, it, expect } from "vitest"

describe("Récupérer la cible avec le moins d'armure parmi une liste d'entités", () => {

    it("lève une erreur si la liste d'entités est vide", () => {
        expect(() => getLowestArmorTarget([])).toThrow()
    })

    it("retourne l'unique entité si la liste n'en contient qu'une", () => {
        const entity = buildPlayingEntity()
        expect(getLowestArmorTarget([entity])).toBe(entity)
    })

    it("retourne l'entité avec le moins d'armure", () => {
        const weak   = withCurrentStats(buildPlayingEntity({ id: "weak" }),   { armor: 10 })
        const strong = withCurrentStats(buildPlayingEntity({ id: "strong" }), { armor: 80 })
        const mid    = withCurrentStats(buildPlayingEntity({ id: "mid" }),    { armor: 40 })

        expect(getLowestArmorTarget([weak, strong, mid]).id).toBe("weak")
    })

    it("retourne le premier trouvé si deux entités ont la même armure", () => {
        const entityA = withCurrentStats(buildPlayingEntity({ id: "a" }), { armor: 50 })
        const entityB = withCurrentStats(buildPlayingEntity({ id: "b" }), { armor: 50 })

        const result = getLowestArmorTarget([entityA, entityB])
        expect(["a", "b"]).toContain(result.id)
    })
})
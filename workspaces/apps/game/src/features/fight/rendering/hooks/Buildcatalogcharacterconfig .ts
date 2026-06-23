import type { Character } from "@services/character.service"
import type { EntityVisual } from "@reflexer/engine"

const SHARED_CATALOG_VISUAL: EntityVisual = {
    referenceHeight: 14,
    // TODO a modifier par la suite
    idle: { path: "priest1/idle.png", frames: 4, frameWidth: 16, frameHeight: 15, durationMs: 700, loop: true },
}

/**
 * Construit la config de combat (stats + visuel) d'un personnage du catalogue
 * à partir de sa fiche DB. Visuel partagé pour l'instant.
 */
export function buildCatalogCharacterConfig(character: Character) {
    return {
        name: character.characterName,
        baseStats: character.baseStats,
        gambits: [], // non utilisés pour le rendu visuel du combat
        visual: SHARED_CATALOG_VISUAL,
    }
}
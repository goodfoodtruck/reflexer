import { EntityName } from "@fight/fight.types"
import { CharacterConfig } from "./ICharacterRegistry"

/**
 * Personnages mockés (en attendant une vraie source persistée) : les lignes de
 * la future table « personnages », indexées par `EntityName`. Seed de
 * `InMemoryCharacterRegistry`, côté moteur comme côté front (libellé + sprite).
 */
export const MOCK_CHARACTERS: Record<EntityName, CharacterConfig> = {
    CHARACTER_1: { gambits: [], baseStats: { health: 100, energy: 50 }, displayName: "Aria", spriteKey: "character_1" },
    CHARACTER_2: { gambits: [], baseStats: { health: 90, energy: 40 }, displayName: "Bjorn", spriteKey: "character_2" },
    ALIEN:  { gambits: [], statsByFloorTier: { 1: { health: 80, energy: 30 } }, displayName: "Alien", spriteKey: "alien" },
    KNIGHT: { gambits: [], statsByFloorTier: { 1: { health: 120, energy: 20 } }, displayName: "Chevalier", spriteKey: "knight" },
    GOBLIN: { gambits: [], statsByFloorTier: { 1: { health: 60, energy: 40 } }, displayName: "Gobelin", spriteKey: "goblin" },
}

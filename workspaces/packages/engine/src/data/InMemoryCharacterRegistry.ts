import { EntityName } from "@fight/fight.types"
import { CharacterConfig, ICharacterRegistry } from "./ICharacterRegistry"

export class InMemoryCharacterRegistry implements ICharacterRegistry {
    constructor(private readonly characters: Record<EntityName, CharacterConfig>) {}

    getConfig(name: EntityName): CharacterConfig {
        const config = this.characters[name]
        if (!config) {
            throw new Error(`Personnage inconnu : ${name}`)
        }
        return config
    }
}

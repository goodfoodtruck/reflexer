import { AllyName, EntityName } from "@fight/fight.types"
import { AllyConfig, IAllyRegistry } from "./IAllyRegistry"
import { CharacterConfig } from "./ICharacterRegistry"

/**
 * Vue « alliés » au-dessus de la table des personnages mockés. Alliés et
 * ennemis partagent aujourd'hui la même source ; ce registre n'en expose que
 * la facette `AllyConfig` (stats de base, gambits...).
 */
export class InMemoryAllyRegistry implements IAllyRegistry {
    constructor(private readonly characters: Record<EntityName, CharacterConfig>) {}

    getConfig(allyName: AllyName): AllyConfig {
        const config = this.characters[allyName]
        if (!config) {
            throw new Error(`Allié inconnu : ${allyName}`)
        }
        return config as AllyConfig
    }
}

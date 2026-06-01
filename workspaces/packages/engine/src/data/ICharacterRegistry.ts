import { EntityName } from "@fight/fight.types"
import { AllyConfig } from "./IAllyRegistry"
import { EnemyConfig } from "./IEnemyRegistry"

/**
 * Config d'un personnage (allié ou ennemi). Alliés et ennemis diffèrent
 * aujourd'hui sur les stats, mais partageront à terme la même table en base ;
 * `CharacterConfig` est ce point d'accès unifié, indexé par `EntityName`.
 */
export type CharacterConfig = AllyConfig | EnemyConfig

export interface ICharacterRegistry {
    getConfig(name: EntityName): CharacterConfig
}

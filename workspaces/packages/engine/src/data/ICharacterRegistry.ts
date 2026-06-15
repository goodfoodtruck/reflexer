import { EntityName } from "@fight/fight.types"
import { EnemyConfig } from "./IEnemyRegistry"
import { EntityVisual } from "./visual.types"

/**
 * Config d'un personnage (allié ou ennemi). Alliés et ennemis diffèrent
 * aujourd'hui sur les stats, mais partageront à terme la même table en base ;
 * `CharacterConfig` est ce point d'accès unifié, indexé par `EntityName`.
 */
export type CharacterConfig = EnemyConfig & {
    name: string
    visual: EntityVisual
}

export interface ICharacterRegistry {
    getConfig(name: EntityName): CharacterConfig
}

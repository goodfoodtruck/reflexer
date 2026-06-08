import { CharacterName, EntityStats } from "@fight/fight.types"
import { Gambit } from "@fight/gambits/gambits.types"
import { EntityVisual } from "./visual.types"

export type AllyConfig = {
    gambits: Gambit[],
    baseStats: EntityStats
    name: string          // libellé affichable du personnage
    visual: EntityVisual  // chemins + métadonnées d'animation des sprites
}

/** On peut récupérer les données sur un personnage spécifique via son nom */
export interface IAllyRegistry {
    getConfig(allyName: CharacterName): AllyConfig
}
import { AllyName, EntityStats } from "@fight/fight.types"
import { Gambit } from "@fight/gambits/gambits.types"

export type AllyConfig = {
    gambits: Gambit[],
    baseStats: EntityStats
}

/** On peut récupérer les données sur un personnage spécifique via son nom */
export interface IAllyRegistry {
    getConfig(allyName: AllyName): AllyConfig
}
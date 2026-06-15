import { EnemyName, EnemyTag, EntityStats } from "@fight/fight.types";
import { Gambit } from "@fight/gambits/gambits.types";

export type EnemyConfig = {
    gambits: Gambit[],
    baseStats: EntityStats
}

export interface IEnemyRegistry {
    getExistingEnemies(enemyTag: EnemyTag): EnemyName[]
    getConfig(enemyName: EnemyName): EnemyConfig
}
import { EnemyName, EnemyTag, EntityStats } from "@fight/fight.types";
import { Gambit } from "@fight/gambits/gambits.types";

export type EnemyConfig = {
    gambits: Gambit[],
    statsByFloorTier: {              // stats différentes selon le niveau d'avancée du joueur dans la run
        [tier: number]: EntityStats  // tier 1 = étages 1-3, tier 2 = étages 4-6...
    }
}

export interface IEnemyRegistry {
    getExistingEnemies(enemyTag: EnemyTag): EnemyName[]
    getConfig(enemyName: EnemyName): EnemyConfig
}
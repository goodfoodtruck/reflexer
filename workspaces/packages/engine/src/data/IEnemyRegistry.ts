import { EnemyTag, EntityStats } from "@fight/fight.types";
import { Gambit } from "@fight/gambits/gambits.types";

export interface IEnemyRegistry {
    getGambits(enemyTag: EnemyTag): Gambit[]
    getBaseStats(enemyTag: EnemyTag): EntityStats
}
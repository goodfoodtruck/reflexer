import { IEnemyRegistry } from "@data/IEnemyRegistry";
import { EnemyTag, PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { pickRandom } from "@helpers/shared/helpers.shared";
import { Position } from "@helpers/types/helpers.types";

export class EnemyBuilder {

    constructor(
        private readonly enemyRegistry: IEnemyRegistry
    ) {}

    buildEnemy(enemyTag: EnemyTag, position: Position, index: number): PlayingEntity {
        const enemyNames = this.enemyRegistry.getExistingEnemies(enemyTag)
        const randomEnemyName = pickRandom(enemyNames)
        const enemyConfig = this.enemyRegistry.getConfig(randomEnemyName)

        return {
            id: this.generateEnemyID(enemyTag, index),
            teamId: "ENEMY",
            tags: [enemyTag],
            position: position,
            baseStats: { ...enemyConfig.baseStats },
            currentStats: { ...enemyConfig.baseStats },
            gambits: [...enemyConfig.gambits],
            statuses: [],
            takeDamage: (amount: number) => { return amount },
            isDead: false
        }
    }

    private generateEnemyID(enemyTag: EnemyTag, index: number): PlayingEntityID {
        return `${enemyTag}_${index}`
    }
}
import { IEnemyRegistry } from "@data/IEnemyRegistry";
import { EnemyTag, IEnemyBuilder, PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { pickRandom } from "@helpers/shared/helpers.shared";
import { Position } from "@helpers/types/helpers.types";

export class EnemyBuilder implements IEnemyBuilder {

    constructor(
        private readonly enemyRegistry: IEnemyRegistry
    ) {}

    buildEnemy(enemyTag: EnemyTag, position: Position, inTeamOrder: number): PlayingEntity {
        // on récupère les ennemis qui ont ce tag et on en choisit un au hasard 
        // qui va spawn
        const enemyNames = this.enemyRegistry.getExistingEnemies(enemyTag)
        const randomEnemyName = pickRandom(enemyNames)
        const enemyConfig = this.enemyRegistry.getConfig(randomEnemyName)

        return {
            id: this.generateEnemyID(enemyTag, inTeamOrder),
            name: randomEnemyName,
            teamId: "ENEMY",
            tag: enemyTag,
            position: position,
            baseStats: { ...enemyConfig.baseStats },
            currentStats: { ...enemyConfig.baseStats },
            gambits: [...enemyConfig.gambits],
            activePassives: [],
            isDead: false
        }
    }

    private generateEnemyID(enemyTag: EnemyTag, inTeamOrder: number): PlayingEntityID {
        return `${enemyTag}_${inTeamOrder}`
    }
}
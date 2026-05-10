import { IEnemyRegistry } from "@data/IEnemyRegistry";
import { EnemyTag, PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { Position } from "@helpers/types/helpers.types";

export class EnemyBuilder {

    constructor(
        private readonly enemyRegistry: IEnemyRegistry
    ) {}

    buildEnemy(enemyTag: EnemyTag, position: Position, index: number): PlayingEntity {
        switch(enemyTag) {
            case "ENEMY_MELEE": return this.buildMeleeEnemy(position, index)
            case "ENEMY_TANK": throw new Error("Not implemented.")
            case "ENEMY_BOSS": throw new Error("Not implemented.")
            case "ENEMY_RANGED": throw new Error("Not implemented.")
        }
    }

    private buildMeleeEnemy(position: Position, index: number): PlayingEntity {
        return {
            id: this.generateEnemyID("ENEMY_MELEE", index),
            teamId: "ENEMY",
            tags: ["ENEMY_MELEE"],
            position: position,
            baseStats: this.enemyRegistry.getBaseStats("ENEMY_MELEE"),
            currentStats: this.enemyRegistry.getBaseStats("ENEMY_MELEE"),
            gambits: this.enemyRegistry.getGambits("ENEMY_MELEE"),
            statuses: [],
            takeDamage: (amount: number) => { return amount },
            isDead: false
        }
    }

    private generateEnemyID(enemyTag: EnemyTag, index: number): PlayingEntityID {
        return `${enemyTag}_${index}`
    }
}
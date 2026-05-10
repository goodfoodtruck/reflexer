import { EnemyTag, PlayingEntity } from "@fight/fight.types";
import { Position } from "@helpers/types/helpers.types";

export class EnemyBuilder {

    buildEnemy(enemyTag: EnemyTag, position: Position): PlayingEntity {
        switch(enemyTag) {
            case "ENEMY_MELEE": return this.buildMeleeEnemy(position)
            case "ENEMY_TANK": throw new Error("Not implemented.")
            case "ENEMY_BOSS": throw new Error("Not implemented.")
            case "ENEMY_RANGED": throw new Error("Not implemented.")
        }
    }

    private buildMeleeEnemy(position: Position): PlayingEntity {
        return {
            id: "", // TODO
            teamId: "ENEMY",
            tags: ["ENEMY_MELEE"],
            position: position,
            baseStats: { health: 100, energy: 10 },
            currentStats: { health: 100, energy: 10 },
            gambits: [], // TODO
            statuses: [],
            takeDamage: (amount: number) => { return amount },
            isDead: false
        }
    }
}
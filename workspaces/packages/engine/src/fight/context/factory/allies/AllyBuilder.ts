import { AllyTag, PlayingEntity, PlayingEntityID } from "@fight/fight.types"
import { Position } from "@helpers/types/helpers.types"

export class AllyBuilder {

    buildAlly(enemyTag: AllyTag, position: Position, index: number): PlayingEntity {
        switch(enemyTag) {
            case "ALLY": return this.build(position, index)
        }
    }

    private build(position: Position, index: number): PlayingEntity {
        return {
            id: this.generateAllyID("ALLY", index),
            teamId: "PLAYER",
            tags: ["ALLY"],
            position: position,
            baseStats: { health: 100, energy: 10 },
            currentStats: { health: 100, energy: 10 },
            gambits: [], // récupérer en DB avant et injecter
            statuses: [], // récupérer par injection
            takeDamage: (amount: number) => { return amount },
            isDead: false
        }
    }
    
    private generateAllyID(allyTag: AllyTag, index: number): PlayingEntityID {
        return `${allyTag}_${index}`
    }
}
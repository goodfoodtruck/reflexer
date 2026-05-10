import { AllyTag, PlayingEntity } from "@fight/fight.types"
import { Position } from "@helpers/types/helpers.types"

export class AllyBuilder {

    buildAlly(enemyTag: AllyTag, position: Position): PlayingEntity {
        switch(enemyTag) {
            case "ALLY": return this.build(position)
        }
    }

    private build(position: Position): PlayingEntity {
        return {
            id: "", // TODO
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
    
}
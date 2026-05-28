import { IAllyRegistry } from "@data/IAllyRegistry"
import { AllyName, IAllyBuilder, PlayingEntity, PlayingEntityID } from "@fight/fight.types"
import { Position } from "@helpers/types/helpers.types"

export class AllyBuilder implements IAllyBuilder {

    constructor(
        private readonly allyRegistry: IAllyRegistry
    ) {}

    buildAlly(allyName: AllyName, position: Position, index: number): PlayingEntity {
        const config = this.allyRegistry.getConfig(allyName)

        return {
            id: this.generateAllyID(allyName, index),
            teamId: "PLAYER",
            tags: [allyName],
            position: position,
            baseStats: { ...config.baseStats },
            currentStats: { ...config.baseStats },
            gambits: [...config.gambits], // récupérer en DB avant et injecter
            statuses: [], // récupérer par injection
            activePassives: [],
            takeDamage: (amount: number) => { return amount },
            isDead: false
        }
    }
    
    private generateAllyID(allyName: AllyName, index: number): PlayingEntityID {
        return `${allyName}_${index}`
    }
}
import { IFightContextReader } from "@fight/context/IFightContextReader";
import { PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { ETargetType, TargetSelector, TargetSort } from "@fight/gambits/gambits.types";
import { getHighestHpTarget } from "@fight/turn-resolvers/target/extractors/highestHPTarget";
import { getLowestHpTarget } from "@fight/turn-resolvers/target/extractors/lowestHPTarget";

export class GambitTargetResolver {

    constructor() {}

    resolve(
        playingEntity: Readonly<PlayingEntity>, 
        fightContext: IFightContextReader, 
        selector: TargetSelector
    ): PlayingEntityID {
        const targetedEntities = this.getTargetedEntities(playingEntity, fightContext, selector.context.targetType)
        const finalTarget = this.getSortedTarget(targetedEntities, selector.sort)

        return finalTarget.id
    }

    private getTargetedEntities(
        playingEntity: Readonly<PlayingEntity>, 
        fightContext: IFightContextReader, 
        targetType: ETargetType
    ): PlayingEntity[] {
        switch(targetType) {
            case "ALLY": return fightContext.getAllies(playingEntity.teamId)
            case "ENEMY": return fightContext.getEnemies(playingEntity.teamId)
            case "SELF": return [playingEntity]
            default: return []
        }
    }

    private getSortedTarget(candidates: Readonly<PlayingEntity[]>, targetSort: TargetSort): PlayingEntity {
        switch (targetSort) {
            case "HIGHEST_HP": return getHighestHpTarget(candidates)
            case "LOWEST_HP": return getLowestHpTarget(candidates)
        }
    }
}
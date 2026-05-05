import { IFightContextReader } from "@fight/context/IFightContextReader";
import { PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { TargetSelector, TargetSort } from "@fight/gambits/gambits.types";
import { getHighestHpTarget } from "@fight/gambits/resolvers/target/extractors/highestHPTarget";
import { getLowestHpTarget } from "@fight/gambits/resolvers/target/extractors/lowestHPTarget";
import { EntityScopeResolver } from "../EntityScopeResolver";

export class GambitTargetResolver {

    constructor(
        private readonly entityScopeResolver: EntityScopeResolver
    ) {}

    /**
     * 
     * @param playingEntity 
     * @param fightContext 
     * @param selector 
     * @returns 
     */
    resolve(
        playingEntity: Readonly<PlayingEntity>, 
        fightContext: IFightContextReader, 
        selector: TargetSelector
    ): PlayingEntityID | null {
        const targetedEntities = this.entityScopeResolver.resolveScope(selector.context.targetType, playingEntity, fightContext)
        const finalTarget = this.getSortedTarget(targetedEntities, selector.sort)

        return finalTarget.id
    }

    /**
     * 
     * @param candidates 
     * @param targetSort 
     * @returns 
     */
    private getSortedTarget(candidates: Readonly<PlayingEntity[]>, targetSort: TargetSort): PlayingEntity {
        switch (targetSort) {
            case "HIGHEST_HP": return getHighestHpTarget(candidates)
            case "LOWEST_HP": return getLowestHpTarget(candidates)
        }
    }
}
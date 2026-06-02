import { IFightContextReader } from "@fight/fight.types";
import { PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { ETargetType, TargetSelector, TargetSort } from "@fight/gambits/gambits.types";
import { getHighestHpTarget } from "@fight/gambits/resolvers/target/extractors/highestHPTarget";
import { getLowestHpTarget } from "@fight/gambits/resolvers/target/extractors/lowestHPTarget";
import { FilterApplier } from "@fight/gambits/resolvers/filters/FilterApplier";
import { EntityScopeResolver } from "@fight/gambits/resolvers/EntityScopeResolver";

export class GambitTargetResolver {

    constructor(
        private readonly filterApplier: FilterApplier,
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
        let candidates = this.entityScopeResolver.resolveScope(selector.context.targetType, playingEntity, fightContext)

        if (selector.context.targetType !== ETargetType.SELF)
            candidates = this.filterApplier.applyAll(candidates, selector.context.filters, { source: playingEntity, fightContext })

        if (! candidates.length) return null

        const finalTarget = this.getSortedTarget(candidates, selector.sort)

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
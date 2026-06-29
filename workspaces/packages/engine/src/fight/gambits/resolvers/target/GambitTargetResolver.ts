import { IFightContextReader } from "@fight/fight.types";
import { PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { ETargetType, TargetSelector, TargetSort } from "@fight/gambits/gambits.types";
import { getHighestHpTarget } from "@fight/gambits/resolvers/target/extractors/hp/highestHPTarget";
import { getLowestHpTarget } from "@fight/gambits/resolvers/target/extractors/hp/lowestHPTarget";
import { EntityScopeResolver } from "@fight/gambits/resolvers/EntityScopeResolver";
import { getNearestTarget, getFurthestTarget } from "@fight/gambits/resolvers/target/extractors/distance/distanceFromSource";
import { getNearestFromGroup, getFurthestFromGroup } from "@fight/gambits/resolvers/target/extractors/distance/distanceFromGroup";
import { getHighestArmorTarget } from "@fight/gambits/resolvers/target/extractors/armor/highestArmorTarget";
import { getLowestArmorTarget } from "@fight/gambits/resolvers/target/extractors/armor/lowestArmorTarget";
import { getLowestEnergyTarget } from "@fight/gambits/resolvers/target/extractors/energy/lowestEnergyTarget";
import { getHighestEnergyTarget } from "@fight/gambits/resolvers/target/extractors/energy/highestEnergyTarget";
import { ConditionResolver } from "@fight/gambits/resolvers/conditions/ConditionResolver";

export class GambitTargetResolver {

    constructor(
        private readonly conditionResolver: ConditionResolver,
        private readonly entityScopeResolver: EntityScopeResolver
    ) {}

    resolve(
        playingEntity: Readonly<PlayingEntity>,
        fightContext: IFightContextReader,
        selector: TargetSelector
    ): PlayingEntityID | null {
        let candidates = this.entityScopeResolver.resolveScope(selector.context.targetType, playingEntity, fightContext)

        if (selector.context.targetType !== ETargetType.SELF && selector.context.condition) {
            const condition = selector.context.condition
            const ctx = { source: playingEntity, fightContext }
            candidates = candidates.filter(c =>
                this.conditionResolver.evaluateConditionForCandidate(condition, c, ctx)
            )
        }

        if (! candidates.length) return null

        const finalTarget = this.getSortedTarget(fightContext, playingEntity, candidates, selector.sort)

        return finalTarget.id
    }

    /**
     * @param sourceEntity Le référenciel utilisé, par exemple pour connaitre la cible la plus proche
     * @param candidates les entités sélectionnées 
     * @param targetSort quelle cible on veut récupérer
     * @returns 
     */
    private getSortedTarget(
        fightContext: IFightContextReader,
        sourceEntity: Readonly<PlayingEntity>,
        candidates: Readonly<PlayingEntity[]>, 
        targetSort: TargetSort
    ): PlayingEntity {
        switch (targetSort) {
            case "HIGHEST_HP": return getHighestHpTarget(candidates)
            case "LOWEST_HP": return getLowestHpTarget(candidates)

            case "NEAREST": return getNearestTarget(sourceEntity, candidates)
            case "FURTHEST": return getFurthestTarget(sourceEntity, candidates)

            case "NEAREST_FROM_ALLY": return getNearestFromGroup(candidates, fightContext.getAllies(sourceEntity))
            case "NEAREST_FROM_ENEMY": return getNearestFromGroup(candidates, fightContext.getEnemies(sourceEntity))

            case "FURTHEST_FROM_ALLY": return getFurthestFromGroup(candidates, fightContext.getAllies(sourceEntity))
            case "FURTHEST_FROM_ENEMY": return getFurthestFromGroup(candidates, fightContext.getEnemies(sourceEntity))

            case "LOWEST_ARMOR": return getLowestArmorTarget(candidates)
            case "HIGHEST_ARMOR": return getHighestArmorTarget(candidates)

            case "LOWEST_ENERGY": return getLowestEnergyTarget(candidates)
            case "HIGHEST_ENERGY": return getHighestEnergyTarget(candidates)
        }
    }
}
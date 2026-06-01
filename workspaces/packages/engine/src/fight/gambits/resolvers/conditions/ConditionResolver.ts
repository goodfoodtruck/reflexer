import { PlayingEntity, IFightContextReader } from "@fight/fight.types"
import { ConditionGroup, ExistsCondition } from "@fight/gambits/gambits.types"
import { isExistsCondition } from "@helpers/gambits"
import { EntityScopeResolver } from "../EntityScopeResolver"
import { FilterApplier } from "../filters"

export class ConditionResolver {

    constructor(
        private readonly filterApplier: FilterApplier,
        private readonly entityScopeResolver: EntityScopeResolver
    ) {}

    evaluateConditionGroup(
        condition: ConditionGroup,
        entity: Readonly<PlayingEntity>,
        context: IFightContextReader
    ): boolean {
        if (isExistsCondition(condition)) {
            return this.evaluateExistsCondition(condition, entity, context)
        }
            
        switch (condition.operator) {
            case "AND": return condition.conditions.every(c => this.evaluateConditionGroup(c, entity, context))
            case "OR":  return condition.conditions.some(c  => this.evaluateConditionGroup(c, entity, context))
            case "NOT": return (! this.evaluateConditionGroup(condition.condition, entity, context))
        }
    }

    private evaluateExistsCondition(
        condition: ExistsCondition,
        entity: Readonly<PlayingEntity>,
        context: IFightContextReader
    ): boolean {
        // entités concernée par la condition : SELF, ALLY, ENEMY
        const candidates = this.entityScopeResolver.resolveScope(condition.context.targetType, entity, context)

        // entités qui matchent avec les critères
        const matchingEntities = this.filterApplier.applyAll(candidates, condition.context.filters, context)

        return matchingEntities.length >= 1
    }

}
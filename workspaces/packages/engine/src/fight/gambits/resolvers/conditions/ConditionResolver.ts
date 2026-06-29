import { PlayingEntity } from "@fight/fight.types"
import { ConditionGroup, ExistsCondition } from "@fight/gambits/gambits.types"
import { isExistsCondition } from "@helpers/gambits"
import { EntityScopeResolver } from "../EntityScopeResolver"
import { FilterApplier, FilterEvaluationContext } from "../filters"

export class ConditionResolver {

    constructor(
        private readonly filterApplier: FilterApplier,
        private readonly entityScopeResolver: EntityScopeResolver
    ) {}

    evaluateConditionGroup(
        condition: ConditionGroup,
        entity: Readonly<PlayingEntity>,
        context: FilterEvaluationContext
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
        context: FilterEvaluationContext
    ): boolean {
        // entités concernée par la condition : SELF, ALLY, ENEMY
        const candidates = this.entityScopeResolver.resolveScope(condition.context.targetType, entity, context.fightContext)

        // entités qui matchent avec les critères
        const matchingEntities = this.filterApplier.applyAll(candidates, condition.context.filters, context)

        return matchingEntities.length >= 1
    }

    /**
     * Évalue un ConditionGroup comme prédicat sur une entité candidate spécifique.
     * Utilisé pour le filtrage des cibles de gambit : chaque candidat est testé
     * individuellement contre la condition (EXISTS = les filtres s'appliquent à lui,
     * AND/OR/NOT récursivement).
     */
    evaluateConditionForCandidate(
        condition: ConditionGroup,
        candidate: Readonly<PlayingEntity>,
        context: FilterEvaluationContext
    ): boolean {
        if (isExistsCondition(condition)) {
            return this.filterApplier.applyAll([candidate as PlayingEntity], condition.context.filters, context).length > 0
        }
        switch (condition.operator) {
            case "AND": return condition.conditions.every(c => this.evaluateConditionForCandidate(c, candidate, context))
            case "OR":  return condition.conditions.some(c  => this.evaluateConditionForCandidate(c, candidate, context))
            case "NOT": return !this.evaluateConditionForCandidate(condition.condition, candidate, context)
        }
    }
}
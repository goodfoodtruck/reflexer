import { FightContext } from "@fight/context/FightContext";
import { GambitTargetResolver } from "./target/GambitTargetResolver";
import { ExecutionContext, PlayingEntity } from "@fight/fight.types";
import { FilterEvaluatorRegistry } from "@fight/gambits/resolvers/filters/FilterEvaluatorRegistry";
import { ActionGambit, ConditionGroup, ExistsCondition } from "@fight/gambits/gambits.types";
import { IFightContextReader } from "@fight/context/IFightContextReader";
import { isExistsCondition } from "@helpers/gambits/typeguards";
import { EntityScopeResolver } from "@fight/gambits/resolvers/EntityScopeResolver";

export class ActionGambitResolver {

    constructor(
        private readonly gambitTargetResolver: GambitTargetResolver,
        private readonly filterEvaluatorRegistry: FilterEvaluatorRegistry,
        private readonly entityScopeResolver: EntityScopeResolver
    ) {}

    /**
     * Évalue les gambits d'action de l'entité.
     * 
     * Retourne un ExecutionContext si, pour un gambit, la condition est valide et que la cible existe, sinon null,
     * dans le cas où l'entité ne peut effectuer aucune action
     * @param playingEntity 
     * @param playingEntityActionGambits 
     * @param fightContext 
     * @returns 
     */
    resolve(
        playingEntity: Readonly<PlayingEntity>, 
        playingEntityActionGambits: ActionGambit[],
        fightContext: FightContext
    ): ExecutionContext | null {
        for (const gambit of playingEntityActionGambits) {
            const conditionValidation = this.evaluateConditionGroup(gambit.conditions, playingEntity, fightContext)
            if (! conditionValidation) continue

            const targetId = this.gambitTargetResolver.resolve(playingEntity, fightContext, gambit.targetSelector)
            if (! targetId) continue

            return {
                casterId: playingEntity.id,
                actionId: gambit.intent.actionId,
                targetId,
                reactionDepth: 0
            }
        }

        return null
    }

    private evaluateConditionGroup(
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
        const candidates = this.entityScopeResolver.resolveScope(condition.scope.targetType, entity, context)

        // entités qui matchent avec les critères
        const matchingEntities = this.filterEvaluatorRegistry.applyAll(candidates, condition.scope.filters, context)

        return matchingEntities.length >= 1
    }
}
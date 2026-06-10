import { FightContext } from "@fight/context/FightContext";
import { ActionExecutionContext, PlayingEntity } from "@fight/fight.types";
import { ConditionResolver, GambitTargetResolver, ActionGambit } from "@fight/gambits";

export class ActionGambitResolver {

    constructor(
        private readonly gambitConditionResolver: ConditionResolver,
        private readonly gambitTargetResolver: GambitTargetResolver,
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
    ): ActionExecutionContext[] {
        const candidates: ActionExecutionContext[] = []

        for (const gambit of playingEntityActionGambits) {
            const conditionValidation = this.gambitConditionResolver.evaluateConditionGroup(gambit.conditions, playingEntity, { source: playingEntity, fightContext })
            if (! conditionValidation) continue

            const targetId = this.gambitTargetResolver.resolve(playingEntity, fightContext, gambit.targetSelector)
            if (! targetId) continue

            candidates.push({
                type: "action",
                casterId: playingEntity.id,
                actionId: gambit.intent.actionId,
                targetId,
                reactionDepth: 0
            })
        }

        return candidates
    }
}
import { IFightContextReader, MovementContext } from "@fight/fight.types";
import { PlayingEntity } from "@fight/fight.types";
import { MovementGambit } from "@fight/gambits/gambits.types";
import { GambitTargetResolver } from "./target";
import { ConditionResolver } from "@fight/gambits";

export class EntityMovementResolver {

    constructor(
        private readonly gambitTargetResolver: GambitTargetResolver,
        private readonly gambitConditionResolver: ConditionResolver
    ) {}
    
    resolve(
        playingEntity: PlayingEntity,
        playingEntityMovementGambits: MovementGambit[],
        fightContext: IFightContextReader
    ): MovementContext | null {
        for (const gambit of playingEntityMovementGambits) {
            const conditionValidation = this.gambitConditionResolver.evaluateConditionGroup(gambit.conditions, playingEntity, { source: playingEntity, fightContext })
            if (! conditionValidation) continue

            const targetId = this.gambitTargetResolver.resolve(playingEntity, fightContext, gambit.targetSelector)
            if (! targetId) continue

            const target = fightContext.getAliveEntityOrThrow(targetId)

            return {
                casterId: playingEntity.id,
                targetPosition: target.position,
                strategy: gambit.intent.strategy
            }
        }

        return null
    }
}
import { ActionLog, PlayingEntity, PlayingEntityID, TurnLog } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { EntityActionExecutor } from "@fight/turn-executors/EntityActionExecutor";
import { EntityMovementExecutor } from "@fight/turn-executors/EntityMovementExecutor";
import { EntityPassiveExecutor } from "@fight/turn-executors/EntityPassiveExecutor";
import { EntityMovementResolver } from "@fight/gambits/resolvers/MovementGambitResolver";
import { ActionGambitResolver } from "@fight/gambits/resolvers/ActionGambitResolver";
import { isActionGambit, isMovementGambit } from "@helpers/gambits/typeguards";
import { Position } from "@helpers/types/helpers.types";

export class TurnController {
    constructor(
        private readonly passivesExecutor: EntityPassiveExecutor,
        private readonly movementResolver: EntityMovementResolver,
        private readonly movementExecutor: EntityMovementExecutor,
        private readonly actionResolver: ActionGambitResolver,
        private readonly actionExecutor: EntityActionExecutor
    ) {}

    /**
     * Joue le tour d'une entité en 4 phases séquentielles :
     * 1. Passifs déclenchés en début de tour (`ON_TURN_START`)
     * 2. Mouvement selon les gambits de mouvement
     * 3. Action selon les gambits d'action
     * 4. Passifs déclenchés en fin de tour (`ON_TURN_END`)
     *
     * Si l'entité meurt à n'importe quelle phase, les passifs `ON_DEATH`
     * sont exécutés et le tour s'arrête immédiatement.
     *
     * @param turnIndex - Index du tour courant dans le combat
     * @param entityId - Identifiant de l'entité dont c'est le tour
     * @param fightContext - Contexte mutable du combat
     * @returns Les logs de toutes les actions exécutées pendant ce tour
    */
    executeEntityTurn(
        turnIndex: Readonly<number>, 
        entityId: PlayingEntityID, 
        fightContext: FightContext
    ): TurnLog {
        const entityTurnLogs: ActionLog[] = []

        const entityTurnSteps = [
            () => this.passivesExecutor.executePassiveTrigger("ON_TURN_START", fightContext.getAliveEntityOrThrow(entityId), fightContext),
            () => this.executeEntityMovement(fightContext.getAliveEntityOrThrow(entityId), fightContext),
            () => this.executeEntityAction(fightContext.getAliveEntityOrThrow(entityId), fightContext),
            () => this.passivesExecutor.executePassiveTrigger("ON_TURN_END", fightContext.getAliveEntityOrThrow(entityId), fightContext)
        ]

        for (const step of entityTurnSteps) {
            entityTurnLogs.push(...step())

            if (fightContext.isEntityDead(entityId)) {
                entityTurnLogs.push(...this.passivesExecutor.executePassiveTrigger("ON_DEATH", fightContext.getAliveEntityOrThrow(entityId), fightContext))
                return { turnIndex, actionLogs: entityTurnLogs }
            }
        }
    
        return { turnIndex, actionLogs: entityTurnLogs }
    }

    private executeEntityMovement(entity: PlayingEntity, fightContext: FightContext): ActionLog[] {
        const entityMovementGambits = entity.gambits.filter(isMovementGambit)

        const movementContext = this.movementResolver.resolve(entity, entityMovementGambits, fightContext)
        const path: Position[] = [];
        if (movementContext && path)
            return this.movementExecutor.execute(path, movementContext, fightContext)
        else 
            return []
    }

    private executeEntityAction(entity: PlayingEntity, fightContext: FightContext): ActionLog[] {
        const entityActionGambits = entity.gambits.filter(isActionGambit)
        
        const actionExecutionContext = this.actionResolver.resolve(entity, entityActionGambits, fightContext)
        if (actionExecutionContext) 
            return this.actionExecutor.execute(actionExecutionContext, fightContext)
        else 
            return []
    }
}
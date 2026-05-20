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
     * Joue le tour d'une entité: 1. application de ses passifs, 2. mouvement et 3. action
     * @param entityId l'entité dont on doit exécuter le tour
     * @returns les logs d'exécution du tour de l'entité
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
    
        // TODO: décrémenter le nombre de tour restants des passifs de l'entité

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
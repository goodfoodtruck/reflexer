import { ActionLog, PlayingEntityID, TurnLog } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { EntityActionExecutor } from "@fight/turn-executors/EntityActionExecutor";
import { EntityMovementExecutor } from "@fight/turn-executors/EntityMovementExecutor";
import { EntityPassiveExecutor } from "@fight/turn-executors/EntityPassiveExecutor";
import { EntityMovementResolver } from "@fight/turn-resolvers/EntityMovementResolver";
import { ActionGambitResolver } from "@fight/turn-resolvers/ActionGambitResolver";
import { isActionGambit } from "@helpers/gambits/typeguards";

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
        fightContext: FightContext): 
    TurnLog {
        const entityTurnLogs: ActionLog[] = []
        
        // executer les passifs
        const entityBeforePassives = fightContext.getAliveEntityOrThrow(entityId)

        const passiveLogs = this.passivesExecutor.executeEntityPassives(entityBeforePassives, fightContext)
        entityTurnLogs.push(...passiveLogs)

        if (fightContext.isEntityDead(entityId)) {
            return { turnIndex, actionLogs: entityTurnLogs }
        }

        // Checker les gambits de mouvement
        const entityBeforeMovement = fightContext.getAliveEntityOrThrow(entityId)

        const movementStrategy = this.movementResolver.resolve(entityBeforeMovement, fightContext)
        if (movementStrategy) {
            const movementLogs = this.movementExecutor.execute(entityBeforeMovement, movementStrategy, fightContext)
            entityTurnLogs.push(...movementLogs)
        }

        // Checker les gambits d'action
        const entityBeforeAction = fightContext.getAliveEntityOrThrow(entityId)
        const entityActionGambits = entityBeforeAction.gambits.filter(isActionGambit)
        
        const actionExecutionContext = this.actionResolver.resolve(entityBeforeAction, entityActionGambits, fightContext)
        if (actionExecutionContext) {
            const actionLogs = this.actionExecutor.execute(actionExecutionContext, fightContext)
            entityTurnLogs.push(...actionLogs)
        }

        return { turnIndex, actionLogs: entityTurnLogs }
    }
}
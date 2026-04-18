import { ActionLog, PlayingEntityID, TurnLog } from "./fight.types";
import { FightContext } from "./context/FightContext";
import { EntityActionExecutor } from "./turn-executors/EntityActionExecutor";
import { EntityMovementExecutor } from "./turn-executors/EntityMovementExecutor";
import { EntityPassiveExecutor } from "./turn-executors/EntityPassiveExecutor";
import { EntityActionResolver } from "./turn-resolvers/EntityActionResolver";
import { EntityMovementResolver } from "./turn-resolvers/EntityMovementResolver";

export class TurnController {
    constructor(
        private readonly passivesExecutor: EntityPassiveExecutor,
        private readonly movementResolver: EntityMovementResolver,
        private readonly movementExecutor: EntityMovementExecutor,
        private readonly actionResolver: EntityActionResolver,
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

        // executer mouvement
        const entityBeforeMovement = fightContext.getAliveEntityOrThrow(entityId)

        const movementStrategy = this.movementResolver.resolve(entityBeforeMovement, fightContext)
        if (movementStrategy) {
            const movementLogs = this.movementExecutor.execute(entityBeforeMovement, movementStrategy, fightContext)
            entityTurnLogs.push(...movementLogs)
        }

        // executer action
        const entityBeforeAction = fightContext.getAliveEntityOrThrow(entityId)

        const actionId = this.actionResolver.resolve(entityBeforeAction, fightContext)
        if (actionId) {
            const actionLogs = this.actionExecutor.execute(entityBeforeAction, actionId, fightContext)
            entityTurnLogs.push(...actionLogs)
        }

        return { turnIndex, actionLogs: entityTurnLogs }
    }
}
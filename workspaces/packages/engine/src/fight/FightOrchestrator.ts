import { FightContext } from "@fight/context/FightContext"
import { FightResult } from "@fight/fight.types"
import { FightStateResolver } from "@fight/FightStateResolver"
import { TurnController } from "@fight/TurnController"
import { FightLogger } from "@fight/FightLogger"

export class FightOrchestrator {

    constructor(
        private readonly turnController: TurnController,
        private readonly fightStateResolver: FightStateResolver
    ) {}

    /**
     * Joue le combat en entier et retourne l'état final ainsi
     * que les logs de tout ce qui s'est passé pendant l'exécution
     * @param context
     */
    playFight(context: FightContext): FightResult {
        const initialState = context.toSnapshot();
        const fightLogger = new FightLogger()

        while (true) {
            const turnIndex = context.getTurnIndex()
            const playingEntity = context.getActingEntity()

            if (! playingEntity) break

            const turnLog = this.turnController.executeEntityTurn(turnIndex, playingEntity.id, context)
            fightLogger.record(turnLog)

            context.nextEntityTurn()
            if (context.isNewTurn()) {
                context.nextTurn()
                context.tickAllPassives()
            }

            const hashedTurnLogs = fightLogger.getLogs().map(fightLogger.hashTurn)

            const fightState = this.fightStateResolver.resolve(context, hashedTurnLogs)
            if (fightState.status === "ENDED")
                return {
                    initialState,
                    endState: fightState.endState,
                    logs: fightLogger.getLogs()
            }
        }

        throw new Error("Combat terminé sans résolution — état impossible")
    }
}
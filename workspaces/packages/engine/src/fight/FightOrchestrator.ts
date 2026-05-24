import { FightContext } from "@fight/context/FightContext"
import { FightResult } from "@fight/fight.types"
import { FightStateResolver } from "@fight/FightStateResolver"
import { TurnController } from "@fight/TurnController"
import { FightLogger } from "@fight/FightLogger"

export class FightOrchestrator {

    constructor(
        private readonly turnController: TurnController,
        private readonly fightLogger: FightLogger,
        private readonly fightStateResolver: FightStateResolver
    ) {}

    /**
     * Joue le combat en entier et retourne l'état final ainsi
     * que les logs de tout ce qui s'est passé pendant l'exécution
     * @param context
     */
    playFight(context: FightContext): FightResult {
        const initialState = context.toSnapshot();

        while (true) {
            const turnIndex = context.getTurnIndex()
            const playingEntity = context.getActingEntity()

            if (! playingEntity) break

            const turnLog = this.turnController.executeEntityTurn(turnIndex, playingEntity.id, context)
            this.fightLogger.record(turnLog)

            context.nextEntityTurn()
            context.isNewTurn() && context.nextTurn()
            
            const fightState = this.fightStateResolver.resolve(context)
            if (fightState.status === "ENDED") 
                return {
                    initialState,
                    endState: fightState.endState,
                    logs: this.fightLogger.getLogs()
            }
        }

        throw new Error("Combat terminé sans résolution — état impossible")
    }
}
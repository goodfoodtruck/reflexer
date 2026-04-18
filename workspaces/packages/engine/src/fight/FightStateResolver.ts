import { FightContext } from "@fight/FightContext"
import { FightState, TurnLog } from "./fight.types";

export class FightStateResolver {

    constructor() {}

    /**
     * 
     * @param _fightContext contexte du combat en cours
     * @param _fightLogs logs du combat depuis son début
     * @returns l'état du combat, savoir si il terminé et pour quelles raisons
     * (mort de tous les membres d'une équipe, boucle de tours détectée...)
     * ou si il continue de tourner
     */
    resolve(_fightContext: FightContext, _fightLogs: TurnLog[]): FightState {
        return {
            status: "RUNNING"
        }
    }
}
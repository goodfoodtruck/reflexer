import { FightContext } from "@fight/context/FightContext"
import { FightState, PlayingEntity, TurnLog } from "./fight.types";

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

    /**
     * Le combat est gagné si toutes les entités ennemies sont vaincues et
     * que le joueur a au moins un personnage encore en vie
     * @param aliveAllies 
     * @param aliveEnemies 
     * @returns 
     */
    isFightWon(aliveAllies: PlayingEntity[], aliveEnemies: PlayingEntity[]): boolean {
        return (aliveEnemies.length === 0) && (aliveAllies.length > 0)
    }

    /**
     * Le combat est perdu si tous les alliés sont vaincus, même si tous les ennemis le sont aussi
     * @param aliveAllies 
     * @returns 
     */
    isFightLost(aliveAllies: PlayingEntity[]): boolean {
        return aliveAllies.length === 0
    }
}
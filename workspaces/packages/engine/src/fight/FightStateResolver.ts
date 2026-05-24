import { FightContext } from "@fight/context/FightContext"
import { FightEndState, FightState, PlayingEntity } from "@fight/fight.types";

export class FightStateResolver {

    constructor() {}

    /**
     *
     * @returns l'état du combat, savoir si il terminé et pour quelles raisons
     * (mort de tous les membres d'une équipe, boucle de tours détectée...)
     * ou si il continue de tourner
     * @param fightContext
     */
    resolve(fightContext: FightContext): FightState {
        const aliveEntities = fightContext.getAliveEntities()
        const aliveAllies = aliveEntities.filter(e => e.teamId === "PLAYER")
        const aliveEnemies = aliveEntities.filter(e => e.teamId === "ENEMY")

        const endState = this.resolveEndState(aliveAllies, aliveEnemies)
        if (! endState) return { status: "RUNNING" }

        return { status: "ENDED", endState }
    }

    resolveEndState(aliveAllies: PlayingEntity[], aliveEnemies: PlayingEntity[]): FightEndState | null {
        if (this.isFightWon(aliveAllies, aliveEnemies)) return "WON"
        if (this.isFightLost(aliveAllies)) return "LOST"

        return null
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
import { FightContextFactory } from "@fight/context/FightContextFactory";
import { FightResult } from "@fight/fight.types";
import { FightOrchestrator } from "@fight/FightOrchestrator";
import { PlayerData } from "@game-engine/game-engine.types";
import { FightError, Result } from "@game-engine/api.types";
import { IFightCommandHandler } from "@game-engine/command-handlers/handlers.interfaces";
import { IFightMapRegistry } from "@data/IFightMapRegistry";
import { FightMapID } from "@fight/map/fight.map.types";

export class FightCommandHandler implements IFightCommandHandler {

    constructor(
        private readonly fightOrchestrator: FightOrchestrator,
        private readonly fightContextFactory: FightContextFactory,
        private readonly fightMapRegistry: IFightMapRegistry,
    ) {}

    playFight(fightMapId: FightMapID, playerData: PlayerData): Result<FightResult, FightError> {
        const fightMapConfig = this.fightMapRegistry.getConfig(fightMapId);

        const fightContext = this.fightContextFactory.create(fightMapConfig, playerData)
        const fightResult = this.fightOrchestrator.playFight(fightContext)

        return {
            success: true,
            value: fightResult
        }
    }

    /**
     * 
     * @param playerData les données du joueur (or, niveau...) avant application
     * du résultat du combat
     * @param result résultat du combat
     * @returns les données du joueur mises à jour
     * @see TODO: créer une classe dédiée
     */
    applyFightResultOnPlayer(playerData: PlayerData, result: FightResult): PlayerData {
        // appliquer résultat du combat sur les données du joueur
        // gain expérience, or...etc
        return playerData
    }
}
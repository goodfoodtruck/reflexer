import { FightContextFactory } from "@fight/context/FightContextFactory";
import { FightResult } from "@fight/fight.types";
import { FightOrchestrator } from "@fight/FightOrchestrator";
import { PlayerData, PveFightConfig, PvpFightConfig, TeamMemberData } from "@game-engine/game-engine.types";
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

    playPveFight(fightMapId: FightMapID, playerData: PlayerData): Result<FightResult, FightError> {
        const fightConfig: PveFightConfig = {
            type: "PVE",
            mapConfig: this.fightMapRegistry.getConfig(fightMapId),
            playerTeam: playerData.playerTeam,
            floorIndex: playerData.playerFloorIndex
        }

        const fightContext = this.fightContextFactory.create(fightConfig)
        const fightResult = this.fightOrchestrator.playFight(fightContext)

        return {
            success: true,
            value: fightResult
        }
    }

    playPvpFight(
        fightMapId: FightMapID, 
        playerTeam: TeamMemberData[],
        opponentTeam: TeamMemberData[]
    ): Result<FightResult, FightError> {
        const fightConfig: PvpFightConfig = {
            type: "PVP",
            mapConfig: this.fightMapRegistry.getConfig(fightMapId),
            playerTeam,
            opponentTeam
        }

        const fightContext = this.fightContextFactory.create(fightConfig)
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
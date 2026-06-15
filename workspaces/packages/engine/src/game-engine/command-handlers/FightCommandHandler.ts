import { FightContextFactory } from "@fight/context/FightContextFactory";
import { EnemyTag, FightResult } from "@fight/fight.types";
import { FightOrchestrator } from "@fight/FightOrchestrator";
import { RunPlayerData, PveFightConfig, PvpFightConfig, TeamMemberData, TrainingFightConfig } from "@game-engine/game-engine.types";
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

    playTrainingFight(
        fightMapId: FightMapID,
        enemyTeamComposition: EnemyTag[], 
        playerTeam: TeamMemberData[]
    ): Result<FightResult, FightError> {
        const fightConfig: TrainingFightConfig = {
            type: "TRAINING",
            mapConfig: this.fightMapRegistry.getConfig(fightMapId),
            enemyTeamComposition,
            playerTeam
        }

        const fightContext = this.fightContextFactory.create(fightConfig)
        const fightResult = this.fightOrchestrator.playFight(fightContext)

        return {
            success: true,
            value: fightResult
        }
    }

    playPveFight(
        fightMapId: FightMapID, 
        playerTeam: TeamMemberData[], 
        runPlayerData: RunPlayerData
    ): Result<FightResult, FightError> {
        const fightConfig: PveFightConfig = {
            type: "PVE",
            mapConfig: this.fightMapRegistry.getConfig(fightMapId),
            playerTeam,
            floorIndex: runPlayerData.playerFloorIndex
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
     * @param runPlayerData les données du joueur (or, niveau...) avant application
     * du résultat du combat
     * @param result résultat du combat
     * @returns les données du joueur mises à jour
     * @see TODO: créer une classe dédiée
     */
    applyFightResultOnPlayer(runPlayerData: RunPlayerData, result: FightResult): RunPlayerData {
        // appliquer résultat du combat sur les données du joueur
        // gain expérience, or...etc
        return runPlayerData
    }
}
import { FightContextFactory } from "@fight/context/FightContextFactory";
import { FightMapConfig, FightResult } from "@fight/fight.types";
import { FightOrchestrator } from "@fight/FightOrchestrator";
import { GameState, PlayerCommand, PlayerData } from "@game-state/game-state.types";

export class GameStateManager {

    private playerData: PlayerData

    constructor(
        private readonly fightOrchestrator: FightOrchestrator,
        private readonly fightContextFactory: FightContextFactory
    ) {
        this.playerData = this.buildNewPlayerData()
    }

    private buildNewPlayerData(): PlayerData {
        return { playerFloorIndex: 1, gold: 0 }
    }

    handleCommand(command: PlayerCommand): GameState {
        switch(command.type) {
            case "PLAY_FIGHT": return this.handlePlayFight(this.playerData)
            case "OPEN_CHEST": return this.handleOpenChest()
            case "ENTER_SHOP": return this.handleEnterShop()
            case "GENERATE_MAP": return this.handleGenerateMap()
        }
    }

    private handleGenerateMap(): GameState {
        return { 
            mode: "MAP", 
            mapData: {}, 
            playerData: this.playerData
        }
    }

    private handleOpenChest(): GameState {
        return { 
            mode: "CHEST", 
            chest: {}, 
            playerData: this.playerData
        }
    }

    private handleEnterShop(): GameState {
        return { 
            mode: "SHOP", 
            shop: {}, 
            playerData: this.playerData
        }
    }

    private handlePlayFight(playerData: PlayerData): GameState {
        // TODO: récupérer la config depuis un registry
        const fightMapConfig: FightMapConfig = {
            dimensions: { width: 10, height: 10 },
            cells: [],
            spawnPoints: {
                player: [],
                enemy: []
            }
        }

        const fightContext = this.fightContextFactory.create(fightMapConfig, playerData)
        const fightResult = this.fightOrchestrator.playFight(fightContext)

        return { 
            mode: "COMBAT", 
            result: fightResult, 
            playerData: this.applyFightResultOnPlayer(playerData, fightResult)
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

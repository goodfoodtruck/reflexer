import { ChestError, Result } from "@game-engine/api.type";
import { ChestData, PlayerData } from "@game-engine/game-engine.types";

export class ChestCommandHandler {

    selectReward(
        itemId: string, 
        chestData: ChestData, 
        playerData: PlayerData
    ): Result<PlayerData, ChestError> {
        throw new Error("Not implemented.")
    }
}
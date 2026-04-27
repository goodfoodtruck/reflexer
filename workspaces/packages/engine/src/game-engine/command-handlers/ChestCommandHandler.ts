import { ChestError, Result } from "@game-engine/api.types";
import { ChestData, PlayerData } from "@game-engine/game-engine.types";
import { IChestCommandHandler } from "@game-engine/command-handlers/handlers.interfaces";

export class ChestCommandHandler implements IChestCommandHandler {

    selectReward(
        itemId: string, 
        chestData: ChestData, 
        playerData: PlayerData
    ): Result<PlayerData, ChestError> {
        throw new Error("Not implemented.")
    }
}
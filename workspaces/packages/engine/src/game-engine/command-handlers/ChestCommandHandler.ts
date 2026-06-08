import { ChestError, Result } from "@game-engine/api.types";
import { ChestData, RunPlayerData } from "@game-engine/game-engine.types";
import { IChestCommandHandler } from "@game-engine/command-handlers/handlers.interfaces";

export class ChestCommandHandler implements IChestCommandHandler {

    selectReward(
        itemId: string, 
        chestData: ChestData, 
        runPlayerData: RunPlayerData
    ): Result<RunPlayerData, ChestError> {
        throw new Error("Not implemented.")
    }
}
import { BuyShopItemValue, Result, ShopError } from "@game-engine/api.types";
import { PlayerData, ShopData } from "@game-engine/game-engine.types";
import { IShopCommandHandler } from "@game-engine/command-handlers/handlers.interfaces";

export class ShopCommandHandler implements IShopCommandHandler {

    buyItem(itemId: string, shopData: ShopData, playerData: PlayerData): Result<BuyShopItemValue, ShopError> {
        return {
            success: true,
            value: {
                updatedPlayerData: playerData,
                updatedShopData: shopData
            }
        }
    }
}
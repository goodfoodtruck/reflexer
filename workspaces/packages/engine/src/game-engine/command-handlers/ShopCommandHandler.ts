import { BuyShopItemValue, Result, ShopError } from "@game-engine/api.type";
import { PlayerData, ShopData } from "@game-engine/game-engine.types";

export class ShopCommandHandler {

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
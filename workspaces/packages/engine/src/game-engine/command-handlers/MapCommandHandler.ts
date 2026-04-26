import { MapError, Result, SelectMapNodeValue } from "@game-engine/api.types"
import { ChestData, MapData, ShopData } from "@game-engine/game-engine.types"
import { IMapCommandHandler } from "./handlers.interfaces"

interface IShopGenerator { generate(floorIndex: number): ShopData }
interface IChestGenerator { generate(floorIndex: number): ChestData }
type NodeType = "COMBAT" | "SHOP" | "CHEST"

export class MapCommandHandler implements IMapCommandHandler {
    constructor(
        private readonly shopGenerator: IShopGenerator,
        private readonly chestGenerator: IChestGenerator
    ) {}

    selectMapNode(nodeId: string, mapData: MapData, floorIndex: number): Result<SelectMapNodeValue, MapError> {        
        const nodeType: NodeType = "COMBAT"

        if (nodeType === "COMBAT") 
            return { success: true,  value: { nodeType: "COMBAT", fightMapId: "" }}
        else if (nodeType === "SHOP")
            return { success: true, value: { nodeType: "SHOP", shopData: this.shopGenerator.generate(floorIndex) }}
        else if (nodeType === "CHEST")
            return { success: true, value: { nodeType: "CHEST", chestData: this.chestGenerator.generate(floorIndex) }}
        else 
            return { success: false, reason: "INVALID_NODE_TYPE" }
    }
}
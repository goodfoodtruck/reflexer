import { GameEngine } from "@game-engine/GameEngine"
import { buildPlayerData } from "@tests/builders/PlayerDataBuilder"

export const buildEngine = (): GameEngine => new GameEngine(
    { 
        generate: () => ({}) 
    },
    { 
        selectMapNode: () => ({ success: true, value: { nodeType: "COMBAT", fightMapId: "map_1" } }) 
    },
    { 
        playFight: () => ({ success: true, value: { endState: "WON", logs: [] } }), 
        applyFightResultOnPlayer: (p) => p 
    },
    { 
        buyItem: () => ({ success: true, value: { updatedPlayerData: buildPlayerData(), updatedShopData: {} } }) 
    },
    { 
        selectReward: () => ({ success: true, value: buildPlayerData() }) 
    }
)
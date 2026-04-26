import { GameEngineDeps } from "@game-engine/game-engine.types"
import { GameEngine } from "@game-engine/GameEngine"
import { buildPlayerData } from "@tests/builders/engine/PlayerDataBuilder"

const defaultDeps: GameEngineDeps = {
    mapGenerator: { 
        generate: () => ({}) 
    },
    mapCommandHandler: { 
        selectMapNode: () => ({ success: true, value: { nodeType: "COMBAT", fightMapId: "map_1" } }) 
    },
    fightHandler: { 
        playFight: () => ({ success: true, value: { endState: "WON", logs: [] } }), 
        applyFightResultOnPlayer: (p) => p 
    },
    shopHandler: { 
        buyItem: () => ({ success: true, value: { updatedPlayerData: buildPlayerData(), updatedShopData: {} } }) },
    chestHandler: { 
        selectReward: () => ({ success: true, value: buildPlayerData() }) 
    }
}

export const buildEngine = (overrides: Partial<GameEngineDeps> = {}): GameEngine => {
    // on fusionne les propriétés par défaut et les overrides
    const deps: GameEngineDeps = {
        mapGenerator:       { ...defaultDeps.mapGenerator,       ...overrides.mapGenerator },
        mapCommandHandler:  { ...defaultDeps.mapCommandHandler,  ...overrides.mapCommandHandler },
        fightHandler:       { ...defaultDeps.fightHandler,       ...overrides.fightHandler },
        shopHandler:        { ...defaultDeps.shopHandler,        ...overrides.shopHandler },
        chestHandler:       { ...defaultDeps.chestHandler,       ...overrides.chestHandler }
    }
    
    return new GameEngine(deps)
}
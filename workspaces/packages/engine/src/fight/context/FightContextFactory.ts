import { FightMapConfig, FightMapSpawnPoints, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { FightMap } from "@fight/FightMap";
import { PlayerData } from "@game-state/game-state.types";

export class FightContextFactory {
    private constructor() {}

    create(
        mapConfig: FightMapConfig, 
        playerData: PlayerData
    ): FightContext {
        const map = new FightMap(mapConfig)
        const playingEntities = this.buildEntities(mapConfig.spawnPoints, playerData)
        return new FightContext(playingEntities, map)
    }

    private buildEntities(
        spawnPoints: FightMapSpawnPoints, 
        playerData: PlayerData
    ): PlayingEntity[] {
        return []
    }
}
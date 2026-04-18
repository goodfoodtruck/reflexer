import { FightMapConfig, FightMapSpawnPoints, PlayerContext, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/FightContext";
import { FightMap } from "@fight/FightMap";

export class FightContextFactory {
    private constructor() {}

    create(
        mapConfig: FightMapConfig, 
        playerContext: PlayerContext
    ): FightContext {
        const map = new FightMap(mapConfig)
        const playingEntities = this.buildEntities(mapConfig.spawnPoints, playerContext)
        return new FightContext(playingEntities, map)
    }

    private buildEntities(
        spawnPoints: FightMapSpawnPoints, 
        playerContext: PlayerContext
    ): PlayingEntity[] {
        return []
    }
}
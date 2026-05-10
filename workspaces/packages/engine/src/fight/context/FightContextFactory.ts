import { PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { FightMap } from "@fight/map/FightMap";
import { FightMapConfig, FightMapSpawnPoints } from "@fight/map/fight.map.types";
import { PlayerData } from "@game-engine/game-engine.types";

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
        // récupérer bons types d'ennemis
        return []
    }
}
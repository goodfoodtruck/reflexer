import { AllyTag, EnemyTag, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { FightMap } from "@fight/map/FightMap";
import { EFightMapSize, FightMapConfig, FightMapSpawnPoints } from "@fight/map/fight.map.types";
import { PlayerData } from "@game-engine/game-engine.types";
import { Position } from "@helpers/types/helpers.types";
import { EnemyBuilder } from "@fight/context/factory/EnemyBuilder";
import { EnemyCompositionResolver } from "@fight/context/factory/EnemyCompositionResolver";
import { AllyBuilder } from "@fight/context/factory/AllyBuilder";
import { AllyCompositionResolver } from "@fight/context/factory/AllyCompositionResolver";
import { NbEnemiesResolver } from "@fight/context/factory/NbEnemiesResolver";
import { FightEntitiesValidator } from "./FightEntitiesValidator";

export class FightContextFactory {

    private constructor(
        private readonly nbEnemiesResolver: NbEnemiesResolver,
        private readonly enemyBuilder: EnemyBuilder,
        private readonly enemyCompositionResolver: EnemyCompositionResolver,
        private readonly allyBuilder: AllyBuilder,
        private readonly allyCompositionResolver: AllyCompositionResolver
    ) {}

    create(
        mapConfig: FightMapConfig, 
        playerData: PlayerData
    ): FightContext {
        const map = new FightMap(mapConfig)
        const playingEntities = this.buildEntities(mapConfig.size, mapConfig.spawnPoints, playerData)

        const validator = new FightEntitiesValidator()
        validator.validate(playingEntities)
        return new FightContext(playingEntities, map)
    }

    private buildEntities(
        size: EFightMapSize,
        spawnPoints: FightMapSpawnPoints,
        playerData: PlayerData
    ): PlayingEntity[] {
        const nbEnemies = this.nbEnemiesResolver.resolve(playerData.playerFloorIndex)
        const enemyTeamComposition = this.enemyCompositionResolver.resolve(size, nbEnemies)
        const enemies = this.buildEnemies(enemyTeamComposition, spawnPoints.enemy)

        const playerTeamComposition = this.allyCompositionResolver.resolve()
        const players = this.buildAllies(playerTeamComposition, spawnPoints.player)

        return [...players, ...enemies]
    }

    private buildEnemies(teamComposition: EnemyTag[], spawnPoints: Position[]): PlayingEntity[] {
        return teamComposition.map((tag, i) => this.enemyBuilder.buildEnemy(tag, spawnPoints[i]!, i + 1))
    }

    private buildAllies(teamComposition: AllyTag[], spawnPoints: Position[]): PlayingEntity[] {
        return teamComposition.map((tag, i) => this.allyBuilder.buildAlly(tag, spawnPoints[i]!, i + 1))
    }
}
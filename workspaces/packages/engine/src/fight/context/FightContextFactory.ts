import { AllyName, EnemyTag, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { FightMap } from "@fight/map/FightMap";
import { EFightMapSize, FightMapConfig, FightMapSpawnPoints } from "@fight/map/fight.map.types";
import { PlayerData } from "@game-engine/game-engine.types";
import { Position } from "@helpers/types/helpers.types";
import { EnemyBuilder } from "@fight/context/factory/enemies/EnemyBuilder";
import { EnemyCompositionResolver } from "@fight/context/factory/enemies/EnemyCompositionResolver";
import { AllyBuilder } from "@fight/context/factory/allies/AllyBuilder";
import { AllyCompositionResolver } from "@fight/context/factory/allies/AllyCompositionResolver";
import { NbEnemiesResolver } from "@fight/context/factory/enemies/NbEnemiesResolver";
import { FightEntitiesValidator } from "./FightEntitiesValidator";

export class FightContextFactory {

    constructor(
        private readonly fightEntitiesValidator: FightEntitiesValidator,
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

        this.fightEntitiesValidator.validate(playingEntities)

        return new FightContext(playingEntities, map)
    }

    private buildEntities(
        size: EFightMapSize,
        spawnPoints: FightMapSpawnPoints,
        playerData: PlayerData
    ): PlayingEntity[] {
        const nbEnemies = this.nbEnemiesResolver.resolve(playerData.playerFloorIndex)
        const enemyTeamComposition = this.enemyCompositionResolver.resolve(size, nbEnemies)
        const enemies = this.buildEnemies(enemyTeamComposition, spawnPoints.enemy, playerData.playerFloorIndex)

        const allies = this.buildAllies(playerData.teamComposition, spawnPoints.player)

        return [...allies, ...enemies]
    }

    private buildEnemies(teamComposition: EnemyTag[], spawnPoints: Position[], floorIndex: number): PlayingEntity[] {
        return teamComposition.map((tag, i) => this.enemyBuilder.buildEnemy(tag, spawnPoints[i]!, i + 1, floorIndex))
    }

    private buildAllies(teamComposition: AllyName[], spawnPoints: Position[]): PlayingEntity[] {
        return teamComposition.map((name, i) => this.allyBuilder.buildAlly(name, spawnPoints[i]!, i + 1))
    }
}
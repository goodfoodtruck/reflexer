import { AllyName, EnemyTag, FightContextFactoryDeps, IAllyBuilder, IEnemyBuilder, IEnemyCompositionResolver, IFightEntitiesValidator, INbEnemiesResolver, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { FightMap } from "@fight/map/FightMap";
import { EFightMapSize, FightMapConfig, FightMapSpawnPoints } from "@fight/map/fight.map.types";
import { PlayerData } from "@game-engine/game-engine.types";
import { Position } from "@helpers/types/helpers.types";

export class FightContextFactory {

    private readonly fightEntitiesValidator: IFightEntitiesValidator
    private readonly nbEnemiesResolver: INbEnemiesResolver
    private readonly enemyBuilder: IEnemyBuilder
    private readonly enemyCompositionResolver: IEnemyCompositionResolver
    private readonly allyBuilder: IAllyBuilder

    constructor(deps: FightContextFactoryDeps) {
        this.fightEntitiesValidator   = deps.validator
        this.nbEnemiesResolver        = deps.nbEnemiesResolver
        this.enemyBuilder             = deps.enemyBuilder
        this.enemyCompositionResolver = deps.enemyCompositionResolver
        this.allyBuilder              = deps.allyBuilder
    }

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
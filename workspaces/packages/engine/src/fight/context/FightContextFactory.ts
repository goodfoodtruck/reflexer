import { EnemyTag, FightContextFactoryDeps, IEnemyBuilder, IEnemyCompositionResolver, IFightEntitiesValidator, INbEnemiesResolver, ITeamBuilder, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { FightMap } from "@fight/map/FightMap";
import { FightConfig, PveFightConfig, PvpFightConfig, TrainingFightConfig } from "@game-engine/game-engine.types";
import { Position } from "@helpers/types";

export class FightContextFactory {

    private readonly fightEntitiesValidator: IFightEntitiesValidator
    private readonly nbEnemiesResolver: INbEnemiesResolver
    private readonly enemyBuilder: IEnemyBuilder
    private readonly enemyCompositionResolver: IEnemyCompositionResolver
    private readonly teamBuilder: ITeamBuilder

    constructor(deps: FightContextFactoryDeps) {
        this.fightEntitiesValidator   = deps.validator
        this.nbEnemiesResolver        = deps.nbEnemiesResolver
        this.enemyBuilder             = deps.enemyBuilder
        this.enemyCompositionResolver = deps.enemyCompositionResolver
        this.teamBuilder              = deps.teamBuilder
    }

    create(fightConfig: FightConfig): FightContext {
        switch(fightConfig.type) {
            case "PVE":      return this.createPveFight(fightConfig)
            case "PVP":      return this.createPvpFight(fightConfig)
            case "TRAINING": return this.createTrainingFight(fightConfig)
        }
    }

    private createTrainingFight(fightConfig: TrainingFightConfig): FightContext {
        const map = new FightMap(fightConfig.mapConfig)
        const enemySpawnPoints = fightConfig.mapConfig.spawnPoints.enemy
        const playerSpawnPoints = fightConfig.mapConfig.spawnPoints.player

        const enemyTeam = this.buildEnemyTeamFromComposition(fightConfig.enemyTeamComposition, enemySpawnPoints)
        const playerTeam = this.teamBuilder.buildTeam(fightConfig.playerTeam, playerSpawnPoints, "PLAYER")

        this.fightEntitiesValidator.validate([...playerTeam, ...enemyTeam])

        return new FightContext([...playerTeam, ...enemyTeam], map)
    }

    private createPveFight(fightConfig: PveFightConfig): FightContext {
        const map = new FightMap(fightConfig.mapConfig)
        const enemySpawnPoints = fightConfig.mapConfig.spawnPoints.enemy
        const playerSpawnPoints = fightConfig.mapConfig.spawnPoints.player
        const nbEnemies = this.nbEnemiesResolver.resolve(fightConfig.floorIndex)
        const enemyTeamComposition = this.enemyCompositionResolver.resolve(fightConfig.mapConfig.size, nbEnemies)

        const enemyTeam = this.buildEnemyTeamFromComposition(enemyTeamComposition, enemySpawnPoints)
        const playerTeam = this.teamBuilder.buildTeam(fightConfig.playerTeam, playerSpawnPoints, "PLAYER")

        this.fightEntitiesValidator.validate([...playerTeam, ...enemyTeam])

        return new FightContext([...playerTeam, ...enemyTeam], map)
    }

    private createPvpFight(fightConfig: PvpFightConfig): FightContext {
        const map = new FightMap(fightConfig.mapConfig)
        const opponentSpawnPoints = fightConfig.mapConfig.spawnPoints.enemy
        const playerSpawnPoints = fightConfig.mapConfig.spawnPoints.player
        
        const playerTeam = this.teamBuilder.buildTeam(fightConfig.playerTeam, playerSpawnPoints, "PLAYER")
        const opponentTeam = this.teamBuilder.buildTeam(fightConfig.opponentTeam, opponentSpawnPoints, "ENEMY")

        this.fightEntitiesValidator.validate([...playerTeam, ...opponentTeam])

        return new FightContext([...playerTeam, ...opponentTeam], map)
    }

    private buildEnemyTeamFromComposition(composition: EnemyTag[], spawns: Position[]): PlayingEntity[] {
        return composition.map((tag, i) => this.enemyBuilder.buildEnemy(tag, spawns[i]!, i + 1))
    }
}
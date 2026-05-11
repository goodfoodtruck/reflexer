import { IEnemyRegistry } from "@data/IEnemyRegistry";
import { EnemyTag, PlayingEntity, PlayingEntityID } from "@fight/fight.types";
import { pickRandom } from "@helpers/shared/helpers.shared";
import { Position } from "@helpers/types/helpers.types";

export class EnemyBuilder {

    constructor(
        private readonly enemyRegistry: IEnemyRegistry
    ) {}

    buildEnemy(enemyTag: EnemyTag, position: Position, index: number, floorIndex: number): PlayingEntity {
        // on récupère les ennemis qui ont ce tag et on en choisit un au hasard 
        // qui va spawn
        const enemyNames = this.enemyRegistry.getExistingEnemies(enemyTag)
        const randomEnemyName = pickRandom(enemyNames)
        const enemyConfig = this.enemyRegistry.getConfig(randomEnemyName)

        // on récupère dans quelle partie de la carte se trouve le joueur
        // plus il est avancé dans la partie, plus les stats des ennemis
        // seront élevées
        const tier = this.resolveTier(floorIndex)
        const enemyStats = enemyConfig.statsByFloorTier[tier]!

        return {
            id: this.generateEnemyID(enemyTag, index),
            teamId: "ENEMY",
            tags: [enemyTag],
            position: position,
            baseStats: { ...enemyStats },
            currentStats: { ...enemyStats },
            gambits: [...enemyConfig.gambits],
            statuses: [],
            takeDamage: (amount: number) => { return amount },
            isDead: false
        }
    }

    /**
     * Retourne dans quel partie de la carte on se trouve.
     * 
     * Le tier permet de récupérer les statistiques d'un ennemi selon le degré de difficulté
     * @param floorIndex 
     * @returns 
     */
    private resolveTier(floorIndex: number): number {
        if (floorIndex <= 3)  return 1
        if (floorIndex <= 6)  return 2
        if (floorIndex <= 10) return 3
        return 4
    }

    private generateEnemyID(enemyTag: EnemyTag, index: number): PlayingEntityID {
        return `${enemyTag}_${index}`
    }
}
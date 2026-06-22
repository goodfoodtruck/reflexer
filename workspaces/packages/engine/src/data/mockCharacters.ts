import { EnemyName, EnemyTag, EntityName } from "@fight/fight.types"
import { ConditionGroup, ETargetType, ExistsCondition, Gambit, MovementStrategy, TargetSelector, TargetSort } from "@fight/gambits/gambits.types"
import { LivingEntityFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { CharacterConfig } from "./ICharacterRegistry"
import { EntityVisual, SpriteClip } from "./visual.types"
import {
    ATTACK_ACTION_ID,
    ATTACK_BLEED_ACTION_ID,
    HEAVY_ATTACK_ACTION_ID,
} from "./mockActions"

// --- Petits constructeurs pour garder les gambits lisibles ---------------------

const hpBelow = (pct: number): LivingEntityFilter => ({ type: "HP_BELOW", threshold: pct })

const existsEnemy = (filters: LivingEntityFilter[] = []): ConditionGroup =>
    ({ type: "EXISTS", context: { targetType: ETargetType.ENEMY, filters }, threshold: 1 })

const existsEnemyCondition = (filters: LivingEntityFilter[]): ExistsCondition =>
    ({ type: "EXISTS", context: { targetType: ETargetType.ENEMY, filters }, threshold: 1 })

const targetEnemy = (sort: TargetSort, filters?: LivingEntityFilter[]): TargetSelector => {
    const condition = filters?.length ? existsEnemyCondition(filters) : undefined
    return condition
        ? { context: { targetType: ETargetType.ENEMY, condition }, sort }
        : { context: { targetType: ETargetType.ENEMY }, sort }
}
const targetSelf = (): TargetSelector =>
    ({ context: { targetType: ETargetType.SELF }, sort: "LOWEST_HP" })

const actionGambit = (
    name: string,
    priority: number,
    conditions: ConditionGroup,
    targetSelector: TargetSelector,
    actionId: string
): Gambit => ({ name, priority, conditions, targetSelector, intent: { kind: "ACTION", actionId } })

/** Ennemi générique : achève les cibles à bas PV, sinon fait saigner. */
const ENEMY_GAMBITS: Gambit[] = [
    actionGambit("Enemy Execute", 1, existsEnemy([hpBelow(35)]), targetEnemy("LOWEST_HP", [hpBelow(35)]), HEAVY_ATTACK_ACTION_ID),
    actionGambit("Enemy Bleed", 2, existsEnemy(), targetEnemy("LOWEST_HP"), ATTACK_BLEED_ACTION_ID),
]

// --- Descripteurs visuels (chemins logiques + métadonnées d'animation) ---------
// `path` est résolu côté front vers l'asset bundlé. Les frames d'un personnage
// partagent la même taille (rognée au contenu, commune à tous ses clips pour que
// l'animation ne saute pas). `referenceHeight` normalise la taille à l'écran.

/** Fabrique les clips d'un personnage : dossier + taille de frame communs. */
const clipsFor = (dir: string, frameWidth: number, frameHeight: number) =>
    (name: string, frames: number, durationMs: number, loop = false): SpriteClip =>
        ({ path: `${dir}/${name}.png`, frames, frameWidth, frameHeight, durationMs, loop })

/** Ennemis (Enemy_Animations_Set) : jeux d'actions complets. */
const sk1 = clipsFor("skeleton1", 28, 20)
const SKELETON_1_VISUAL: EntityVisual = {
    referenceHeight: 15,
    idle:   sk1("idle",   6, 900, true),
    move:   sk1("move",  10, 700, true),
    attack: sk1("attack", 9, 450),
    hurt:   sk1("hurt",   5, 250),
    death:  sk1("death", 17, 800),
}
const sk2 = clipsFor("skeleton2", 32, 27)
const SKELETON_2_VISUAL: EntityVisual = {
    referenceHeight: 15,
    idle:   sk2("idle",   6, 900, true),
    move:   sk2("move",  10, 700, true),
    attack: sk2("attack",15, 600),
    hurt:   sk2("hurt",   5, 250),
    death:  sk2("death", 15, 700),
}
const vmp = clipsFor("vampire", 30, 25)
const VAMPIRE_VISUAL: EntityVisual = {
    referenceHeight: 16,
    idle:   vmp("idle",   6, 900, true),
    move:   vmp("move",   8, 600, true),
    attack: vmp("attack",16, 640),
    hurt:   vmp("hurt",   5, 250),
    death:  vmp("death", 14, 650),
}

export const MOCK_ENEMY_CONFIGS: Record<EnemyName, CharacterConfig> = {
    ALIEN:  { gambits: ENEMY_GAMBITS, baseStats: { health: 80, energy: 30, armor: 0 }, name: "Alien", visual: VAMPIRE_VISUAL },
    KNIGHT: { gambits: ENEMY_GAMBITS, baseStats: { health: 120, energy: 20, armor: 0 }, name: "Chevalier", visual: SKELETON_2_VISUAL },
    GOBLIN: { gambits: ENEMY_GAMBITS, baseStats: { health: 60, energy: 40, armor: 0 }, name: "Gobelin", visual: SKELETON_1_VISUAL },
}

/**
 * Mapping tag → noms d'ennemis pouvant spawn pour ce tag. Sert à
 * `InMemoryEnemyRegistry.getExistingEnemies` (le `EnemyConfig` ne porte pas son tag).
 */
export const MOCK_ENEMIES_BY_TAG: Record<EnemyTag, EnemyName[]> = {
    ENEMY_MELEE:  ["KNIGHT"],
    ENEMY_RANGED: ["ALIEN", "GOBLIN"],
    ENEMY_TANK:   ["KNIGHT"],
    ENEMY_BOSS:   ["KNIGHT"],
}

/**
 * Entrées « ennemis » à plat pour `InMemoryEnemyRegistry` : chaque ennemi avec
 * ses tags (dérivés de `MOCK_ENEMIES_BY_TAG`) et sa config de combat (gambits +
 * stats de base, extraits de `MOCK_ENEMY_CONFIGS`).
 */
const ENEMY_TAGS_BY_NAME = (Object.entries(MOCK_ENEMIES_BY_TAG) as [EnemyTag, EnemyName[]][])
    .reduce<Record<string, EnemyTag[]>>((acc, [tag, names]) => {
        for (const name of names) (acc[name] ??= []).push(tag)
        return acc
    }, {})

export const MOCK_ENEMIES = Object.entries(ENEMY_TAGS_BY_NAME).map(([name, tags]) => {
    const config = MOCK_ENEMY_CONFIGS[name as EnemyName]
    return { name: name as EnemyName, tags, gambits: config?.gambits, baseStats: config?.baseStats }
})

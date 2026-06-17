import { EnemyName, EnemyTag, EntityName } from "@fight/fight.types"
import { ConditionGroup, ETargetType, Gambit, MovementStrategy, TargetSelector, TargetSort } from "@fight/gambits/gambits.types"
import { LivingEntityFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { CharacterConfig } from "./ICharacterRegistry"
import { EntityVisual, SpriteClip } from "./visual.types"
import {
    APPLY_THORNS_ACTION_ID,
    ATTACK_ACTION_ID,
    ATTACK_BLEED_ACTION_ID,
    CURSE_ACTION_ID,
    HEAVY_ATTACK_ACTION_ID,
    THORNS_PASSIVE_ID,
    VULNERABLE_PASSIVE_ID,
} from "./mockActions"

// --- Petits constructeurs pour garder les gambits lisibles ---------------------

const hpBelow = (pct: number): LivingEntityFilter => ({ type: "HP_BELOW", threshold: pct })
const hpAbove = (pct: number): LivingEntityFilter => ({ type: "HP_ABOVE", threshold: pct })
const hasPassive = (passiveId: string): LivingEntityFilter => ({ type: "HAS_PASSIVE", passiveId })

const existsEnemy = (filters: LivingEntityFilter[] = []): ConditionGroup =>
    ({ type: "EXISTS", context: { targetType: ETargetType.ENEMY, filters }, threshold: 1 })
const existsSelf = (filters: LivingEntityFilter[] = []): ConditionGroup =>
    ({ type: "EXISTS", context: { targetType: ETargetType.SELF, filters }, threshold: 1 })
const not = (condition: ConditionGroup): ConditionGroup => ({ operator: "NOT", condition })
const and = (conditions: ConditionGroup[]): ConditionGroup => ({ operator: "AND", conditions })

const targetEnemy = (sort: TargetSort, filters: LivingEntityFilter[] = []): TargetSelector =>
    ({ context: { targetType: ETargetType.ENEMY, filters }, sort })
const targetSelf = (): TargetSelector =>
    ({ context: { targetType: ETargetType.SELF }, sort: "LOWEST_HP" })

const actionGambit = (
    name: string,
    priority: number,
    conditions: ConditionGroup,
    targetSelector: TargetSelector,
    actionId: string
): Gambit => ({ name, priority, conditions, targetSelector, intent: { kind: "ACTION", actionId } })

const movementGambit = (
    name: string,
    priority: number,
    conditions: ConditionGroup,
    targetSelector: TargetSelector,
    strategy: MovementStrategy
): Gambit => ({ name, priority, conditions, targetSelector, intent: { kind: "MOVEMENT", strategy } })

const BRUISER_GAMBITS: Gambit[] = [
    movementGambit("Bruiser Approach", 1, existsEnemy(), targetEnemy("LOWEST_HP"), "APPROACH"),
    actionGambit("Bruiser Thorns", 1, not(existsSelf([hasPassive(THORNS_PASSIVE_ID)])), targetSelf(), APPLY_THORNS_ACTION_ID),
    actionGambit("Bruiser Execute", 2, existsEnemy([hpBelow(30)]), targetEnemy("LOWEST_HP", [hpBelow(30)]), HEAVY_ATTACK_ACTION_ID),
    actionGambit("Bruiser Bleed", 3, existsEnemy(), targetEnemy("LOWEST_HP"), ATTACK_BLEED_ACTION_ID),
]

/** Affaibliseur : maudit l'ennemi le plus sain (une fois), puis tape les gros. */
const DEBUFFER_GAMBITS: Gambit[] = [
    movementGambit("Debuffer Approach", 1, existsEnemy(), targetEnemy("HIGHEST_HP"), "APPROACH"),
    actionGambit(
        "Debuffer Curse",
        1,
        and([existsEnemy([hpAbove(50)]), not(existsEnemy([hasPassive(VULNERABLE_PASSIVE_ID)]))]),
        targetEnemy("HIGHEST_HP", [hpAbove(50)]),
        CURSE_ACTION_ID
    ),
    actionGambit("Debuffer Attack", 2, existsEnemy(), targetEnemy("HIGHEST_HP"), ATTACK_ACTION_ID),
]

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

/** Prêtres (héros) : idle uniquement → attaque/dégâts/mort via fallback front. */
const priest1 = clipsFor("priest1", 16, 15)
const PRIEST_1_VISUAL: EntityVisual = { referenceHeight: 14, idle: priest1("idle", 4, 700, true) }
const priest2 = clipsFor("priest2", 13, 15)
const PRIEST_2_VISUAL: EntityVisual = { referenceHeight: 14, idle: priest2("idle", 4, 700, true) }

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

/**
 * Personnages mockés (en attendant une vraie source persistée) : les lignes de
 * la future table « personnages », indexées par `EntityName`. Seed de
 * `InMemoryCharacterRegistry`, côté moteur comme côté front (libellé + visuel).
 */
export const MOCK_CHARACTERS: Record<EntityName, CharacterConfig> = {
    CHARACTER_1: { gambits: BRUISER_GAMBITS, baseStats: { health: 100, energy: 50, armor: 0 }, name: "Aria", visual: PRIEST_2_VISUAL },
    CHARACTER_2: { gambits: DEBUFFER_GAMBITS, baseStats: { health: 90, energy: 40, armor: 0 }, name: "Bjorn", visual: PRIEST_1_VISUAL },
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
 * stats de base, extraits de `MOCK_CHARACTERS`).
 */
const ENEMY_TAGS_BY_NAME = (Object.entries(MOCK_ENEMIES_BY_TAG) as [EnemyTag, EnemyName[]][])
    .reduce<Record<string, EnemyTag[]>>((acc, [tag, names]) => {
        for (const name of names) (acc[name] ??= []).push(tag)
        return acc
    }, {})

export const MOCK_ENEMIES = Object.entries(ENEMY_TAGS_BY_NAME).map(([name, tags]) => {
    const config = MOCK_CHARACTERS[name as EnemyName]
    return { name: name as EnemyName, tags, gambits: config.gambits, baseStats: config.baseStats }
})

import { EnemyName, EnemyTag, EntityName } from "@fight/fight.types"
import { ConditionGroup, ETargetType, Gambit, TargetSelector, TargetSort } from "@fight/gambits/gambits.types"
import { LivingEntityFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { CharacterConfig } from "./ICharacterRegistry"
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
    id: string,
    priority: number,
    conditions: ConditionGroup,
    targetSelector: TargetSelector,
    actionId: string
): Gambit => ({ id, priority, conditions, targetSelector, intent: { kind: "ACTION", actionId } })

const BRUISER_GAMBITS: Gambit[] = [
    actionGambit("bruiser_thorns", 1, not(existsSelf([hasPassive(THORNS_PASSIVE_ID)])), targetSelf(), APPLY_THORNS_ACTION_ID),
    actionGambit("bruiser_execute", 2, existsEnemy([hpBelow(30)]), targetEnemy("LOWEST_HP", [hpBelow(30)]), HEAVY_ATTACK_ACTION_ID),
    actionGambit("bruiser_bleed", 3, existsEnemy(), targetEnemy("LOWEST_HP"), ATTACK_BLEED_ACTION_ID),
]

/** Affaibliseur : maudit l'ennemi le plus sain (une fois), puis tape les gros. */
const DEBUFFER_GAMBITS: Gambit[] = [
    actionGambit(
        "debuffer_curse",
        1,
        and([existsEnemy([hpAbove(50)]), not(existsEnemy([hasPassive(VULNERABLE_PASSIVE_ID)]))]),
        targetEnemy("HIGHEST_HP", [hpAbove(50)]),
        CURSE_ACTION_ID
    ),
    actionGambit("debuffer_attack", 2, existsEnemy(), targetEnemy("HIGHEST_HP"), ATTACK_ACTION_ID),
]

/** Ennemi générique : achève les cibles à bas PV, sinon fait saigner. */
const ENEMY_GAMBITS: Gambit[] = [
    actionGambit("enemy_execute", 1, existsEnemy([hpBelow(35)]), targetEnemy("LOWEST_HP", [hpBelow(35)]), HEAVY_ATTACK_ACTION_ID),
    actionGambit("enemy_bleed", 2, existsEnemy(), targetEnemy("LOWEST_HP"), ATTACK_BLEED_ACTION_ID),
]

/**
 * Personnages mockés (en attendant une vraie source persistée) : les lignes de
 * la future table « personnages », indexées par `EntityName`. Seed de
 * `InMemoryCharacterRegistry`, côté moteur comme côté front (libellé + sprite).
 */
export const MOCK_CHARACTERS: Record<EntityName, CharacterConfig> = {
    CHARACTER_1: { gambits: BRUISER_GAMBITS, baseStats: { health: 100, energy: 50 }, displayName: "Aria", spriteKey: "character_1" },
    CHARACTER_2: { gambits: DEBUFFER_GAMBITS, baseStats: { health: 90, energy: 40 }, displayName: "Bjorn", spriteKey: "character_2" },
    ALIEN:  { gambits: ENEMY_GAMBITS, statsByFloorTier: { 1: { health: 80, energy: 30 } }, displayName: "Alien", spriteKey: "alien" },
    KNIGHT: { gambits: ENEMY_GAMBITS, statsByFloorTier: { 1: { health: 120, energy: 20 } }, displayName: "Chevalier", spriteKey: "knight" },
    GOBLIN: { gambits: ENEMY_GAMBITS, statsByFloorTier: { 1: { health: 60, energy: 40 } }, displayName: "Gobelin", spriteKey: "goblin" },
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

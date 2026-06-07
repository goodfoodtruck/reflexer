import { ERange, PlayingEntity } from "@fight/fight.types"
import { IFightContextReader } from "@fight/fight.types"
import { PassiveID } from "@fight/passives/passives.types"

export type FilterEvaluationContext = {
    source: PlayingEntity             // l'entité qui évalue le gambit
    fightContext: IFightContextReader // pour lire l'état du combat
}

/**
 * Type de fonction qui permet de vérifier si une cible rempli un critère
 * avec TFilter le type du critère correspondant
 */
export type FilterEvaluator<TFilter> = (
    entity: PlayingEntity,
    filter: TFilter,
    context: FilterEvaluationContext
) => boolean



/** Filtres applicables à toute entité vivante (soi-même, allié, ennemi) */
export type HpBelowFilter =     { type: "HP_BELOW",    threshold: number }
export type HpAboveFilter =     { type: "HP_ABOVE",    threshold: number }
export type HasPassiveFilter =  { type: "HAS_PASSIVE", passiveId: PassiveID }

export type LivingEntityFilter =
    | HpBelowFilter
    | HpAboveFilter
    | HasPassiveFilter


/** Filtres applicables à soi-même. */
export type SelfFilter = LivingEntityFilter


/** applicable à un allié ou un ennemi, pour vérifier si il est à portée */
export type InRangeFilter = { type: "IN_RANGE", range: ERange }

/** Filtres applicables aux alliés */
export type CharacterInRangeOfEnemyFilter = { type: "ALLY_IN_RANGE_OF_ENEMY", range: ERange }
export type CharacterInRangeOfCharacterFilter =  { type: "ALLY_IN_RANGE_OF_ALLY",  range: ERange }

export type CharacterFilter =
    | LivingEntityFilter
    | CharacterInRangeOfEnemyFilter
    | CharacterInRangeOfCharacterFilter
    | InRangeFilter




/** Filtres applicables aux ennemis */
export type EnemyInRangeOfCharacterFilter = { type: "ENEMY_IN_RANGE_OF_ALLY", range: ERange }
export type IsAttackingCharacterFilter =    { type: "IS_ATTACKING_ALLY" }
export type IsAttackingSelfFilter =    { type: "IS_ATTACKING_SELF" }

export type EnemyFilter =
    | LivingEntityFilter
    | EnemyInRangeOfCharacterFilter
    | IsAttackingCharacterFilter
    | IsAttackingSelfFilter
    | InRangeFilter

    
export type AnyFilter = 
    | EnemyFilter
    | CharacterFilter
    | SelfFilter


// "HP_BELOW" | "HP_ABOVE" | "HAS_PASSIVE" | "IN_RANGE" | "ALLY_IN_RANGE_OF_ENEMY" | ...
export type FilterType =
    | LivingEntityFilter["type"]
    | CharacterFilter["type"]
    | EnemyFilter["type"]
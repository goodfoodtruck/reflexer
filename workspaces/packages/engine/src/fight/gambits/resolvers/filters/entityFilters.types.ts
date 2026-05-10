import { PlayingEntity } from "@fight/fight.types"
import { IStatus } from "@fight/context/IStatus"
import { IFightContextReader } from "@fight/context/IFightContextReader"

/**
 * Type de fonction qui permet de vérifier si une cible rempli un critère
 * avec TFilter le type du critère correspondant
 */
export type FilterEvaluator<TFilter> = (
    entity: PlayingEntity,
    filter: TFilter,
    context: IFightContextReader
) => boolean


/** Filtres applicables à toute entité vivante (soi-même, allié, ennemi) */
export type HpBelowFilter =   { type: "HP_BELOW",   threshold: number }
export type HpAboveFilter =   { type: "HP_ABOVE",   threshold: number }
export type HasStatusFilter =  { type: "HAS_STATUS", status: IStatus }
export type InRangeFilter =    { type: "IN_RANGE",   range: number }

export type LivingEntityFilter =
    | HpBelowFilter
    | HpAboveFilter
    | HasStatusFilter
    | InRangeFilter


/** Filtres applicables à soi-même. */
export type SelfFilter = LivingEntityFilter



/** Filtres applicables aux alliés */
export type AllyInRangeOfEnemyFilter = { type: "ALLY_IN_RANGE_OF_ENEMY", range: number }
export type AllyInRangeOfAllyFilter =  { type: "ALLY_IN_RANGE_OF_ALLY",  range: number }

export type AllyFilter =
    | LivingEntityFilter
    | AllyInRangeOfEnemyFilter
    | AllyInRangeOfAllyFilter




/** Filtres applicables aux ennemis */
export type EnemyInRangeOfAllyFilter = { type: "ENEMY_IN_RANGE_OF_ALLY", range: number }
export type IsAttackingAllyFilter =    { type: "IS_ATTACKING_ALLY" }
export type IsAttackingSelfFilter =    { type: "IS_ATTACKING_SELF" }

export type EnemyFilter =
    | LivingEntityFilter
    | EnemyInRangeOfAllyFilter
    | IsAttackingAllyFilter
    | IsAttackingSelfFilter

    
export type AnyFilter = 
    | EnemyFilter
    | AllyFilter
    | SelfFilter


// "HP_BELOW" | "HP_ABOVE" | "HAS_STATUS" | "IN_RANGE" | "ALLY_IN_RANGE_OF_ENEMY" | ...
export type FilterType =
    | LivingEntityFilter["type"]
    | AllyFilter["type"]
    | EnemyFilter["type"]
import { SelfFilter, CharacterFilter, EnemyFilter } from "@fight/gambits/resolvers/filters/entityFilters.types"

/** Statuts pouvant affecter une entité pendant le combat */
export type Status = "POISON" | "BURNT" | "PARALYZED"

/**
 * Un gambit est une règle comportementale complète.
 * Évalué dans l'ordre de priorité croissante — le premier gambit
 * dont les conditions sont vraies ET dont une cible est trouvée est exécuté.
 */
export type Gambit = {
    /** Libellé affichable (présentation). Porté par la donnée, optionnel côté gameplay. */
    name: string
    /** Ordre d'évaluation — priorité 1 évaluée en premier */
    priority: number
    /** Déclencheur : dans quelle situation ce gambit doit-il s'activer ? */
    conditions: ConditionGroup
    /** Ciblage : sur quelle entité l'intent sera-t-il appliqué ? */
    targetSelector: TargetSelector
    /** Ce que l'entité fait si le gambit est résolu */
    intent: GambitIntent
}

export type ActionIntent = { kind: "ACTION"; actionId: string }
export type MovementIntent = { kind: "MOVEMENT"; strategy: MovementStrategy }

export type ActionGambit = Gambit & { intent: ActionIntent }
export type MovementGambit = Gambit & { intent: MovementIntent }

/**
 * Ce que l'entité fait quand le gambit est résolu.
 * - ACTION : exécute une action définie dans l'ActionRepository
 * - MOVEMENT : demande un déplacement selon une stratégie
 */
export type GambitIntent = ActionIntent | MovementIntent



/**
 * Stratégie de déplacement adoptée par l'entité.
 * - APPROACH : se rapprocher de la cible résolue
 * - FLEE : s'éloigner de la cible résolue
 * - STAY : rester sur place
 */
export type MovementStrategy = "APPROACH" | "FLEE" | "STAY"

/**
 * Arbre de décisions évalué avant de chercher une cible.
 * Si l'arbre entier est vrai, on passe au ciblage.
 * Les feuilles de l'arbre sont des ExistsCondition — des requêtes d'existence d'une entité.
 */
export type ConditionGroup =
    | { operator: "AND"; conditions: ConditionGroup[] }
    | { operator: "OR";  conditions: ConditionGroup[] }
    | { operator: "NOT"; condition: ConditionGroup }
    | ExistsCondition

/**
 * Requête d'existence au sein du combat.
 * Réussit si au moins `threshold` entités correspondant
 * au scope et à ses filtres sont trouvées dans le snapshot.
 *
 * @example
 * // "il existe un allié empoisonné"
 * { type: "EXISTS", scope: { kind: "ALLY", filters: [{ type: "HAS_PASSIVE", status: "POISON" }] } }
 *
 * @example
 * // "il existe au moins 2 ennemis à portée 3"
 * { type: "EXISTS", scope: { kind: "ENEMY", filters: [{ type: "IN_RANGE", range: 3 }] }, threshold: 2 }
 */
export type ExistsCondition = {
    type: "EXISTS"
    /** Définit qui on cherche et avec quels critères */
    context: ConditionContext
    /** Nombre minimum d'entités requises pour que la condition soit vraie. Défaut : 1 */
    threshold?: number
}

/**
 * Types de cibles que le joueur peut choisir
 */
export enum ETargetType {
    SELF = "SELF",
    ENEMY = "ENEMY",
    ALLY = "ALLY"
}

/**
 * Discriminant par type d'entité ciblée par la condition.
 * Garantit qu'on ne peut pas appliquer un filtre spécifique à un ennemi sur un allié.
 * Chaque variant porte les filtres valides pour son type.
 */
type ConditionContext =
    | { targetType: ETargetType.SELF,  filters: SelfFilter[] }
    | { targetType: ETargetType.ENEMY, filters: EnemyFilter[] }
    | { targetType: ETargetType.ALLY,  filters: CharacterFilter[] }

/**
 * Sélecteur de cible évalué après les conditions.
 * Cherche parmi les entités satisfaisant le context,
 * puis sélectionne la meilleure selon le critère de tri.
 * Si aucune cible n'est trouvée, le gambit est ignoré.
 */
export type TargetSelector = {
    /** Pool de candidats : qui peut être ciblé et avec quels critères */
    context: TargetContext
    /** 
     * Critère de sélection de la cible
     * 
     * Par exemple: la plus proche, celle qui a le moins de HP...etc
     *  */
    sort: TargetSort
}

/**
 * Discriminant par type de cible.
 * Les filtres réduisent le pool avant application du tri.
 * SELF n'a pas de filtres — il n'y a qu'une seule entité possible.
 */
type TargetContext =
    | { targetType: ETargetType.SELF }
    | { targetType: ETargetType.ENEMY, filters: EnemyFilter[] }
    | { targetType: ETargetType.ALLY,  filters: CharacterFilter[] }

/**
 * Critère de sélection de la cible finale parmi les candidats filtrés.
 * - NEAREST : la plus proche en nombre de cases
 * - FURTHEST : la plus éloignée en nombre de cases
 * - LOWEST_HP : celle avec le moins de HP restants
 * - HIGHEST_HP : celle avec le plus de HP restants
 */
export type TargetSort =
    | "LOWEST_HP"
    | "HIGHEST_HP"
    | "NEAREST"
    | "FURTHEST"
    | "NEAREST_FROM_ALLY"
    | "NEAREST_FROM_ENEMY"
    | "FURTHEST_FROM_ALLY"
    | "FURTHEST_FROM_ENEMY"

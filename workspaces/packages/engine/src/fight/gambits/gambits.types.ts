/** Statuts pouvant affecter une entité pendant le combat */
type Status = "POISON" | "BURNT" | "PARALYZED"

/**
 * Un gambit est une règle comportementale complète.
 * Évalué dans l'ordre de priorité croissante — le premier gambit
 * dont les conditions sont vraies ET dont une cible est trouvée est exécuté.
 */
export type Gambit = {
    /** Identifiant unique du gambit */
    id: string
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

/**
 * Ce que l'entité fait quand le gambit est résolu.
 * - ACTION : exécute une action définie dans l'ActionRepository
 * - MOVEMENT : demande un déplacement selon une stratégie
 */
type GambitIntent = ActionIntent | MovementIntent



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
type ConditionGroup =
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
 * { type: "EXISTS", scope: { kind: "ALLY", filters: [{ type: "HAS_STATUS", status: "POISON" }] } }
 *
 * @example
 * // "il existe au moins 2 ennemis à portée 3"
 * { type: "EXISTS", scope: { kind: "ENEMY", filters: [{ type: "IN_RANGE", range: 3 }] }, threshold: 2 }
 */
type ExistsCondition = {
    type: "EXISTS"
    /** Définit qui on cherche et avec quels critères */
    scope: ConditionContext
    /** Nombre minimum d'entités requises pour que la condition soit vraie. Défaut : 1 */
    threshold?: number
}

/**
 * Discriminant par type d'entité ciblée par la condition.
 * Garantit qu'on ne peut pas appliquer un filtre spécifique à un ennemi sur un allié.
 * Chaque variant porte les filtres valides pour son type.
 */
type ConditionContext =
    | { kind: "SELF";  filters: SelfFilter[] }
    | { kind: "ALLY";  filters: AllyFilter[] }
    | { kind: "ENEMY"; filters: EnemyFilter[] }
    | { kind: "TILE";  filters: TileFilter[] }

/** Filtres applicables à toute entité vivante (soi-même, allié, ennemi) */
type LivingEntityFilter =
    | { type: "HP_BELOW";   threshold: number } // HP courant inférieur à threshold %
    | { type: "HP_ABOVE";   threshold: number } // HP courant supérieur à threshold %
    | { type: "HAS_STATUS"; status: Status }    // affectée par ce statut
    | { type: "IN_RANGE";   range: number }     // à moins de `range` cases de l'entité courante

/**
 * Filtres applicables à soi-même.
 * Alias de LivingEntityFilter — explicite pour l'extensibilité future.
 */
type SelfFilter = LivingEntityFilter

/** Filtres applicables aux alliés */
type AllyFilter =
    | LivingEntityFilter
    | { type: "ALLY_IN_RANGE_OF_ENEMY"; range: number } // à moins de `range` cases d'un ennemi
    | { type: "ALLY_IN_RANGE_OF_ALLY";  range: number } // à moins de `range` cases d'un autre allié

/** Filtres applicables aux ennemis */
type EnemyFilter =
    | LivingEntityFilter
    | { type: "ENEMY_IN_RANGE_OF_ALLY"; range: number } // à moins de `range` cases d'un allié
    | { type: "IS_ATTACKING_ALLY" }                     // attaque un allié ce tour
    | { type: "IS_ATTACKING_SELF" }                     // attaque l'entité courante ce tour

/** Filtres applicables aux cases de la grille de combat */
type TileFilter =
    | { type: "IS_TRAP" }                       // la case contient un piège
    | { type: "HAS_EFFECT" }                    // la case a un effet actif
    | { type: "IN_RANGE"; range: number }       // à moins de `range` cases de l'entité courante

/**
 * Sélecteur de cible évalué après les conditions.
 * Cherche parmi les entités satisfaisant le context,
 * puis sélectionne la meilleure selon le critère de tri.
 * Si aucune cible n'est trouvée, le gambit est ignoré.
 */
type TargetSelector = {
    /** Pool de candidats : qui peut être ciblé et avec quels critères */
    context: TargetContext
    /** Critère de sélection de la cible finale parmi les candidats */
    sort: TargetSort
}

/**
 * Discriminant par type de cible.
 * Les filtres réduisent le pool avant application du tri.
 * SELF n'a pas de filtres — il n'y a qu'une seule entité possible.
 */
type TargetContext =
    | { kind: "SELF" }
    | { kind: "ENEMY"; filters: EnemyFilter[] }
    | { kind: "ALLY";  filters: AllyFilter[] }
    | { kind: "TILE";  filters: TileFilter[] }

/**
 * Critère de sélection de la cible finale parmi les candidats filtrés.
 * - NEAREST : la plus proche en nombre de cases
 * - LOWEST_HP : celle avec le moins de HP restants
 * - HIGHEST_HP : celle avec le plus de HP restants
 * - MOST_DANGEROUS : celle avec la plus haute stat d'attaque
 * - RANDOM : aléatoire parmi les candidats
 */
type TargetSort =
    | "NEAREST"
    | "LOWEST_HP"
    | "HIGHEST_HP"
    | "MOST_DANGEROUS"
    | "RANDOM"
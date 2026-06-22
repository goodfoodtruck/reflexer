/**
 * Source de vérité unique des filtres de portée "relationnels" : ceux qui
 * testent si une entité (autre que SELF) est à portée d'une autre.
 *
 * L'UI n'expose que deux catégories — « à portée d'un allié » / « à portée
 * d'un ennemi ». Le scope de l'entité TESTÉE (ALLY ou ENEMY) détermine lequel
 * des quatre filtres moteur on construit. Affichage et aller-retour en dérivent.
 */

/** Sous-ensemble de AnyFilter["type"] couvrant les relations de portée */
export type RangeRelationFilterType =
  | 'CHARACTER_IN_RANGE_OF_ANOTHER'
  | 'CHARACTER_IN_RANGE_OF_ENEMY'
  | 'ENEMY_IN_RANGE_OF_CHARACTER'
  | 'ENEMY_IN_RANGE_OF_ANOTHER';

/** Catégorie exposée dans l'éditeur : à portée de QUI */
export type RangeRelationCategoryId = 'in_range_of_ally' | 'in_range_of_enemy';

type RangeRelation = {
  filterType: RangeRelationFilterType;
  scope: 'ALLY' | 'ENEMY';            // entité testée (le targetType du EXISTS)
  categoryId: RangeRelationCategoryId; // relatif à un allié / un ennemi
  label: string;                       // libellé d'affichage
};

const RANGE_RELATIONS: readonly RangeRelation[] = [
  { filterType: 'CHARACTER_IN_RANGE_OF_ANOTHER', scope: 'ALLY',  categoryId: 'in_range_of_ally',  label: "à portée d'un allié" },
  { filterType: 'CHARACTER_IN_RANGE_OF_ENEMY',   scope: 'ALLY',  categoryId: 'in_range_of_enemy', label: "à portée d'un ennemi" },
  { filterType: 'ENEMY_IN_RANGE_OF_CHARACTER',   scope: 'ENEMY', categoryId: 'in_range_of_ally',  label: "à portée d'un allié" },
  { filterType: 'ENEMY_IN_RANGE_OF_ANOTHER',     scope: 'ENEMY', categoryId: 'in_range_of_enemy', label: "à portée d'un ennemi" },
];

const FILTER_TYPES = RANGE_RELATIONS.map((r) => r.filterType);
const CATEGORY_IDS: RangeRelationCategoryId[] = ['in_range_of_ally', 'in_range_of_enemy'];

export const isRangeRelationFilterType = (type: string): type is RangeRelationFilterType =>
  (FILTER_TYPES as string[]).includes(type);

export const isRangeRelationCategory = (id: string): id is RangeRelationCategoryId =>
  (CATEGORY_IDS as string[]).includes(id);

/** scope + catégorie UI → filtre moteur. null si le scope est SELF (aucune relation possible). */
export const resolveRangeRelationType = (
  scope: string,
  categoryId: RangeRelationCategoryId
): RangeRelationFilterType | null =>
  RANGE_RELATIONS.find((r) => r.scope === scope && r.categoryId === categoryId)?.filterType ?? null;

/** filtre moteur → catégorie UI */
export const rangeRelationCategory = (type: RangeRelationFilterType): RangeRelationCategoryId =>
  RANGE_RELATIONS.find((r) => r.filterType === type)!.categoryId;

/** filtre moteur → libellé d'affichage */
export const rangeRelationLabel = (type: RangeRelationFilterType): string =>
  RANGE_RELATIONS.find((r) => r.filterType === type)!.label;
import type { CategoryId, BlockValue, ConditionBlock, FilterEntry, FilterOrGroup } from './filters/filterRegistry';
export type { ConditionBlock, FilterEntry, FilterOrGroup };

export type Scope = 'SELF' | 'ALLY' | 'ENEMY';

/**
 * Un DraftCondition = UN bloc de l'éditeur : une catégorie + les valeurs
 * sélectionnées dedans. Plusieurs valeurs dans un même bloc = "OU".
 * Plusieurs blocs sur un même scope = "ET".
 */
export type DraftCondition = {
  id: string;
  scopeKind: Scope;
  filterTypeCategory: CategoryId;
  blockValues: BlockValue[];
  /** Opérateur entre les blocs de ce scope (ET par défaut). */
  scopeOperator?: 'AND' | 'OR';
  /** Opérateur entre les valeurs de ce bloc (OU par défaut). */
  valuesOperator?: 'AND' | 'OR';
};

export type DraftGambit = {
  name: string;
  operator: 'AND' | 'OR';
  conditions: DraftCondition[];
  intentKind: 'ACTION' | 'MOVEMENT';
  intentValue: string;
  targetKind: Scope;
  targetSort: string;
  targetFilters: FilterOrGroup[];
  /** Operator between each consecutive filter group pair. Index i = operator between group i and group i+1. */
  targetFilterGroupOps: ('AND' | 'OR')[];
  /** Operator between values within each filter group. Index i = valuesOperator for group i. */
  targetFilterValuesOps: ('AND' | 'OR')[];
};

export type ActionItem = {
  id: string;
  name: string;
  description: string;
  kind: 'ACTION' | 'MOVEMENT';
  image?: string;
  cost?: number;
  effect?: string;
};

export type ActionCategory = {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: ActionItem[];
};

export type SavedCondition = {
  targetId: string;
  blocks: ConditionBlock[];
  /** One operator per block: blockOperators[i] = connector between block[i] and block[i+1].
   *  Length equals blocks.length; the last entry is the default for the next pending group. */
  blockOperators: ('AND' | 'OR')[];
};
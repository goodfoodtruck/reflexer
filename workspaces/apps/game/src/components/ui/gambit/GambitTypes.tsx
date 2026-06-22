import type { CategoryId, BlockValue, ConditionBlock } from './filters/filterRegistry';
export type { ConditionBlock };

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
};

export type DraftGambit = {
  name: string;
  operator: 'AND' | 'OR';
  conditions: DraftCondition[];
  intentKind: 'ACTION' | 'MOVEMENT';
  intentValue: string;
  targetKind: Scope;
  targetSort: string;
  targetFilters: ConditionBlock[];
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
  blockOperator: 'AND' | 'OR';
};
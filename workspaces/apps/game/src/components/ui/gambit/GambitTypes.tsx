import type { FilterType } from "@reflexer/engine";

export type DraftCondition = {
  id: string;
  scopeKind: "SELF" | "ALLY" | "ENEMY";
  filterType: FilterType
  value: number | string;
};

export type DraftGambit = {
  name: string;
  operator: "AND" | "OR";
  conditions: DraftCondition[];
  intentKind: "ACTION" | "MOVEMENT";
  intentValue: string;
  targetKind: "SELF" | "ALLY" | "ENEMY";
  targetSort: string;
  targetFilters: {
    categoryId: string;
    values: string[]
  }[];
};

export type ActionItem = {
  id: string;
  name: string;
  description: string;
  kind: "ACTION" | "MOVEMENT";
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

export type ConditionBlock = { categoryId: string; values: string[] };
export type SavedCondition = { targetId: string; blocks: ConditionBlock[] };
export interface GambitFilter {
  type: string; 
  threshold?: number;
  range?: number;
  status?: string;
}

export interface GambitScope {
  kind: "SELF" | "ENEMY" | "ALLY" | "TILE" | string;
  filter?: GambitFilter;
}

export type GambitCondition =
  | { type: "EXISTS"; scope: GambitScope }
  | { operator: "AND" | "OR"; conditions: GambitCondition[] }
  | { operator: "NOT"; condition: GambitCondition };

  
export interface TargetContext {
  kind: "SELF" | "ENEMY" | "ALLY" | "TILE" | string;
  filters?: GambitFilter[]; 
}

export interface TargetSelector {
  context: TargetContext;
  sort: "NEAREST" | "LOWEST_HP" | "MOST_DANGEROUS" | "HIGHEST_HP" | string;
}

export type GambitIntent =
  | { 
      kind: "MOVEMENT"; 
      strategy: "FLEE" | "APPROACH" | "STAY" | string;
    }
  | { 
      kind: "ACTION"; 
      action: {
        id: string;
        type: string; 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processorConfigs?: any[]; // TODO a modifier
      };
    };

export interface RealGambit {
  id: string;
  name: string;
  priority: number;
  conditions: GambitCondition;
  targetSelector: TargetSelector;
  intent: GambitIntent;
}

export type DraftCondition = {
  id: string;
  scopeKind: "SELF" | "ALLY" | "ENEMY";
  filterType: "HP_BELOW" | "IN_RANGE";
  value: number;
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
  cibles?: string;
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
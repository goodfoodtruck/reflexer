// ─── Types ─────────────────────────────────────────────────────

export type ConditionTargetKind = 'enemy' | 'ally' | 'self' | 'other';

export interface ConditionValue {
  id: string;
  label: string;
  conditionType: string;
  params: Record<string, number>;
}

export interface ConditionCategory {
  id: string;
  label: string;
}

export interface ConditionTargetConfig {
  target: ConditionTargetKind;
  targetLabel: string;
  categories: ConditionCategory[];
  valuesByCategory: Record<string, ConditionValue[]>;
}

// ─── Configuration ─────────────────────────────────────────────

export const CONDITION_CONFIG: ConditionTargetConfig[] = [
  {
    target: 'enemy',
    targetLabel: 'Ennemi',
    categories: [
      { id: 'health',   label: 'Health' },
      { id: 'armor',    label: 'Armor' },
      { id: 'distance', label: 'Distance de moi' },
      { id: 'count',    label: 'Nombre' },
      { id: 'status',   label: 'Status' },
      { id: 'buffs',    label: 'Buffs' },
    ],
    valuesByCategory: {
      health: [
        { id: 'e_hp_lt_25',  label: 'PV < 25%',  conditionType: 'HEALTH_BELOW', params: { threshold: 25 } },
        { id: 'e_hp_lt_50',  label: 'PV < 50%',  conditionType: 'HEALTH_BELOW', params: { threshold: 50 } },
        { id: 'e_hp_lt_75',  label: 'PV < 75%',  conditionType: 'HEALTH_BELOW', params: { threshold: 75 } },
        { id: 'e_hp_gt_50',  label: 'PV > 50%',  conditionType: 'HEALTH_ABOVE', params: { threshold: 50 } },
        { id: 'e_hp_gt_75',  label: 'PV > 75%',  conditionType: 'HEALTH_ABOVE', params: { threshold: 75 } },
      ],
      armor: [
        { id: 'e_def_gt_5',  label: 'DEF > 5',   conditionType: 'STAT_ABOVE', params: { stat: 1, threshold: 5 } },
        { id: 'e_def_gt_10', label: 'DEF > 10',  conditionType: 'STAT_ABOVE', params: { stat: 1, threshold: 10 } },
        { id: 'e_def_lt_5',  label: 'DEF < 5',   conditionType: 'STAT_BELOW', params: { stat: 1, threshold: 5 } },
      ],
      distance: [
        { id: 'e_range_1',   label: 'À portée 1 (mêlée)',  conditionType: 'ENEMY_IN_RANGE', params: { range: 1 } },
        { id: 'e_range_2',   label: 'À portée 2',          conditionType: 'ENEMY_IN_RANGE', params: { range: 2 } },
        { id: 'e_range_3',   label: 'À portée 3',          conditionType: 'ENEMY_IN_RANGE', params: { range: 3 } },
        { id: 'e_range_4',   label: 'À portée 4+',         conditionType: 'ENEMY_IN_RANGE', params: { range: 4 } },
      ],
      count: [
        { id: 'e_count_1',   label: '≥ 1 ennemi',   conditionType: 'ENEMY_COUNT', params: { count: 1 } },
        { id: 'e_count_2',   label: '≥ 2 ennemis',  conditionType: 'ENEMY_COUNT', params: { count: 2 } },
        { id: 'e_count_3',   label: '≥ 3 ennemis',  conditionType: 'ENEMY_COUNT', params: { count: 3 } },
        { id: 'enemies_2plus', label: '≥2 enemies in range', conditionType: 'ENEMY_COUNT_AT_RANGE', params: { range: 1, min: 2 } },
      ],
      status: [
        { id: 'e_has_poison', label: 'Est empoisonné',  conditionType: 'HAS_STATUS', params: { effectType: 0 } },
        { id: 'e_has_stun',   label: 'Est étourdi',     conditionType: 'HAS_STATUS', params: { effectType: 1 } },
      ],
      buffs: [
        { id: 'e_has_shield',  label: 'A un bouclier',   conditionType: 'HAS_STATUS', params: { effectType: 2 } },
        { id: 'e_has_atk_up',  label: 'ATK augmentée',   conditionType: 'HAS_STATUS', params: { effectType: 3 } },
        { id: 'e_has_def_up',  label: 'DEF augmentée',   conditionType: 'HAS_STATUS', params: { effectType: 5 } },
      ],
    },
  },
  {
    target: 'ally',
    targetLabel: 'Allié',
    categories: [
      { id: 'health',   label: 'Health' },
      { id: 'distance', label: 'Distance de moi' },
      { id: 'status',   label: 'Status' },
      { id: 'buffs',    label: 'Buffs' },
    ],
    valuesByCategory: {
      health: [
        { id: 'a_hp_lt_25',  label: 'PV < 25%',  conditionType: 'ALLY_HEALTH_BELOW', params: { threshold: 25 } },
        { id: 'a_hp_lt_50',  label: 'PV < 50%',  conditionType: 'ALLY_HEALTH_BELOW', params: { threshold: 50 } },
        { id: 'a_hp_lt_75',  label: 'PV < 75%',  conditionType: 'ALLY_HEALTH_BELOW', params: { threshold: 75 } },
        { id: 'a_hp_gt_50',  label: 'PV > 50%',  conditionType: 'ALLY_HEALTH_ABOVE', params: { threshold: 50 } },
      ],
      distance: [
        { id: 'a_range_1',   label: 'À portée 1',  conditionType: 'ALLY_IN_RANGE', params: { range: 1 } },
        { id: 'a_range_2',   label: 'À portée 2',  conditionType: 'ALLY_IN_RANGE', params: { range: 2 } },
        { id: 'a_range_3',   label: 'À portée 3',  conditionType: 'ALLY_IN_RANGE', params: { range: 3 } },
      ],
      status: [
        { id: 'a_has_poison', label: 'Est empoisonné', conditionType: 'ALLY_HAS_STATUS', params: { effectType: 0 } },
        { id: 'a_has_stun',   label: 'Est étourdi',    conditionType: 'ALLY_HAS_STATUS', params: { effectType: 1 } },
      ],
      buffs: [
        { id: 'a_has_shield', label: 'A un bouclier',  conditionType: 'ALLY_HAS_STATUS', params: { effectType: 2 } },
        { id: 'a_has_regen',  label: 'A de la regen',  conditionType: 'ALLY_HAS_STATUS', params: { effectType: 9 } },
      ],
    },
  },
  {
    target: 'self',
    targetLabel: 'Soi-même',
    categories: [
      { id: 'health',   label: 'Health' },
      { id: 'status',   label: 'Status' },
    ],
    valuesByCategory: {
      health: [
        { id: 's_hp_lt_25',  label: 'Mes PV < 25%',  conditionType: 'HEALTH_BELOW', params: { threshold: 25 } },
        { id: 's_hp_lt_50',  label: 'Mes PV < 50%',  conditionType: 'HEALTH_BELOW', params: { threshold: 50 } },
        { id: 's_hp_gt_50',  label: 'Mes PV > 50%',  conditionType: 'HEALTH_ABOVE', params: { threshold: 50 } },
        { id: 's_hp_gt_75',  label: 'Mes PV > 75%',  conditionType: 'HEALTH_ABOVE', params: { threshold: 75 } },
      ],
      status: [
        { id: 's_has_poison', label: 'Empoisonné',   conditionType: 'HAS_STATUS', params: { effectType: 0 } },
        { id: 's_has_stun',   label: 'Étourdi',      conditionType: 'HAS_STATUS', params: { effectType: 1 } },
        { id: 's_has_shield', label: 'Bouclier actif', conditionType: 'HAS_STATUS', params: { effectType: 2 } },
      ],
    },
  },
  {
    target: 'other',
    targetLabel: 'Autre',
    categories: [
      { id: 'always', label: 'Général' },
    ],
    valuesByCategory: {
      always: [
        { id: 'o_always',  label: 'Toujours',  conditionType: 'ALWAYS', params: {} },
      ],
    },
  },
];

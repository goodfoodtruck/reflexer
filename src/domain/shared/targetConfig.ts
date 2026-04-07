import { TargetType } from '@domain/shared/types';

// ─── Types ─────────────────────────────────────────────────────

export type TargetKind = 'enemy' | 'ally' | 'self';

export interface TargetFilterValue {
  id: string;
  label: string;
  // Serialisable vers le moteur de jeu
  filterType: string;        // ex: 'HEALTH_BELOW', 'NEAREST', 'WEAKEST', 'DISTANCE_LTE'
  params: Record<string, number | string>;
}

export interface TargetFilterCategory {
  id: string;
  label: string;
}

export interface TargetKindConfig {
  kind: TargetKind;
  kindLabel: string;
  categories: TargetFilterCategory[];
  valuesByCategory: Record<string, TargetFilterValue[]>;
}

// ─── Config ────────────────────────────────────────────────────

export const TARGET_CONFIG: TargetKindConfig[] = [
  {
    kind: 'enemy',
    kindLabel: 'Ennemi',
    categories: [
      { id: 'priority', label: 'Priorité' },
      { id: 'health',   label: 'Santé' },
      { id: 'distance', label: 'Distance' },
      { id: 'count',    label: 'Nombre' },
    ],
    valuesByCategory: {
      priority: [
        { id: 'e_nearest',  label: 'Le plus proche',  filterType: 'NEAREST',   params: {} },
        { id: 'e_furthest', label: 'Le plus loin',     filterType: 'FURTHEST',  params: {} },
        { id: 'e_weakest',  label: 'Le plus faible',   filterType: 'WEAKEST',   params: {} },
        { id: 'e_strongest',label: 'Le plus fort',     filterType: 'STRONGEST', params: {} },
      ],
      health: [
        { id: 'e_hp_lt_25', label: 'PV < 25%', filterType: 'HEALTH_BELOW', params: { threshold: 25 } },
        { id: 'e_hp_lt_50', label: 'PV < 50%', filterType: 'HEALTH_BELOW', params: { threshold: 50 } },
        { id: 'e_hp_gt_75', label: 'PV > 75%', filterType: 'HEALTH_ABOVE', params: { threshold: 75 } },
      ],
      distance: [
        { id: 'e_dist_1', label: '≤ 1 case',  filterType: 'DISTANCE_LTE', params: { range: 1 } },
        { id: 'e_dist_2', label: '≤ 2 cases', filterType: 'DISTANCE_LTE', params: { range: 2 } },
        { id: 'e_dist_3', label: '≤ 3 cases', filterType: 'DISTANCE_LTE', params: { range: 3 } },
      ],
      count: [
        { id: 'e_cnt_2', label: '≥ 2 ennemis visibles', filterType: 'ENEMY_COUNT_GTE', params: { min: 2 } },
        { id: 'e_cnt_3', label: '≥ 3 ennemis visibles', filterType: 'ENEMY_COUNT_GTE', params: { min: 3 } },
      ],
    },
  },
  {
    kind: 'ally',
    kindLabel: 'Allié',
    categories: [
      { id: 'priority', label: 'Priorité' },
      { id: 'health',   label: 'Santé' },
      { id: 'distance', label: 'Distance' },
    ],
    valuesByCategory: {
      priority: [
        { id: 'a_nearest', label: 'Le plus proche', filterType: 'NEAREST', params: {} },
        { id: 'a_weakest',  label: 'Le plus faible', filterType: 'WEAKEST', params: {} },
      ],
      health: [
        { id: 'a_hp_lt_25', label: 'PV < 25%', filterType: 'HEALTH_BELOW', params: { threshold: 25 } },
        { id: 'a_hp_lt_50', label: 'PV < 50%', filterType: 'HEALTH_BELOW', params: { threshold: 50 } },
        { id: 'a_hp_gt_50', label: 'PV > 50%', filterType: 'HEALTH_ABOVE', params: { threshold: 50 } },
      ],
      distance: [
        { id: 'a_dist_1', label: '≤ 1 case',  filterType: 'DISTANCE_LTE', params: { range: 1 } },
        { id: 'a_dist_3', label: '≤ 3 cases', filterType: 'DISTANCE_LTE', params: { range: 3 } },
      ],
    },
  },
  {
    kind: 'self',
    kindLabel: 'Soi-même',
    categories: [],
    valuesByCategory: {},
  },
];

// ─── Types ─────────────────────────────────────────────────────

export interface TargetValue {
  id: string;
  label: string;
  targetType: TargetType;
}

export interface TargetCategory {
  id: string;
  label: string;
}
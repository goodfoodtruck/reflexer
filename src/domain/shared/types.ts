import { ConditionTargetKind, ConditionValue } from "./conditionConfig";
import { TargetFilterValue, TargetKind } from "./targetConfig";

export type SpellCategory = 'attack' | 'defense' | 'heal' | 'boost' | 'move';

export interface SpellEffect {
  label: string;   // ex: "+20 Soins sur la cible"
  icon?: string;   // ex: 'heart', 'shield'
}

export interface SpellDefinition {
  id: SpellId;
  name: string;
  category: SpellCategory;        // ← nouveau
  description?: string;           // ← nouveau  ex: "Applique un patch biologique..."
  cost: number;                   // ← nouveau  coût en énergie
  effects: SpellEffect[];         // ← nouveau  liste d'effets affichés dans la fiche
  damage: number;
  range: number;
  cooldown: number;
  targetType: SpellTargetType;
  areaRadius?: number;
  statusEffect?: StatusEffectDefinition;
}

// ─── Identifiants ──────────────────────────────────────────────
export type EntityId = string;
export type SpellId = string;
export type AutomationId = string;
export type NodeId = string;

// ─── Grille ────────────────────────────────────────────────────
export interface GridPosition {
  x: number;
  y: number;
}

export interface GridConfig {
  width: number;
  height: number;
  obstacles: GridPosition[];
}

// ─── Équipe ────────────────────────────────────────────────────
export enum Team {
  Player = 'PLAYER',
  Enemy = 'ENEMY',
}

// ─── Stats de base ─────────────────────────────────────────────
export interface BaseStats {
  atk: number;
  def: number;
  spd: number;
  range: number;
}

// ─── Sorts ─────────────────────────────────────────────────────
export enum SpellTargetType {
  Single = 'SINGLE',
  Area = 'AREA',
  Self = 'SELF',
  Line = 'LINE',
}

export interface SpellDefinition {
  id: SpellId;
  name: string;
  damage: number;
  range: number;
  cooldown: number;
  targetType: SpellTargetType;
  areaRadius?: number;
  statusEffect?: StatusEffectDefinition;
}

// ─── Effets de statut ──────────────────────────────────────────
export enum StatusEffectType {
  Poison = 'POISON',
  Stun = 'STUN',
  Shield = 'SHIELD',
  AttackUp = 'ATK_UP',
  AttackDown = 'ATK_DOWN',
  DefenseUp = 'DEF_UP',
  DefenseDown = 'DEF_DOWN',
  SpeedUp = 'SPD_UP',
  SpeedDown = 'SPD_DOWN',
  Regen = 'REGEN',
}

export interface StatusEffectDefinition {
  type: StatusEffectType;
  duration: number;
  value: number; // magnitude de l'effet
}

export interface ActiveStatusEffect extends StatusEffectDefinition {
  remainingTurns: number;
  sourceId: EntityId;
}

// ─── Automatismes ──────────────────────────────────────────────
export enum ConditionType {
  HealthBelow = 'HEALTH_BELOW',
  HealthAbove = 'HEALTH_ABOVE',
  EnemyInRange = 'ENEMY_IN_RANGE',
  AllyInRange = 'ALLY_IN_RANGE',
  HasStatusEffect = 'HAS_STATUS',
  AllyHealthBelow = 'ALLY_HEALTH_BELOW',
  EnemyCount = 'ENEMY_COUNT',
  Always = 'ALWAYS',
}

export enum ActionType {
  CastSpell = 'CAST_SPELL',
  Move = 'MOVE',
  Flee = 'FLEE',
  Defend = 'DEFEND',
  PassTurn = 'PASS',
}

export enum TargetType {
  NearestEnemy = 'NEAREST_ENEMY',
  WeakestEnemy = 'WEAKEST_ENEMY',
  StrongestEnemy = 'STRONGEST_ENEMY',
  NearestAlly = 'NEAREST_ALLY',
  WeakestAlly = 'WEAKEST_ALLY',
  Self = 'SELF',
  FurthestEnemy = 'FURTHEST_ENEMY',
}

// ─── Automatismes — TARGET ──────────────────────────────────────

export interface TargetFilter {
  id: string;
  categoryId: string;
  value: TargetFilterValue; // défini dans targetConfig.ts
}

export interface TargetBlock {
  id: string;
  targetKind: TargetKind;          // 'enemy' | 'ally' | 'self'
  filters: TargetFilter[];         // combinés en ET dans ce bloc
}

// Remplace l'ancien AutomationTarget { type: TargetType }
export interface AutomationTarget {
  blocks: TargetBlock[];           // combinés en OU entre blocs
}

export interface AutomationAction {
  type: ActionType;
  params: Record<string, string>;
}

interface AtomicCondition {
    id: string;
    categoryId: string;
    value: ConditionValue;
}

export interface ConditionBlock {
    id: string;
    targetKind: ConditionTargetKind;
    conditions: AtomicCondition[];
}

export interface AutomationTarget {
  blocks: TargetBlock[];
}

export interface AutomationRule {
  id: AutomationId;
  name: string;
  priority: number;
  conditions: ConditionBlock[];
  action: AutomationAction;
  target: AutomationTarget;
}

// ─── Définition d'entité (template pour spawner) ───────────────
export interface EntityDefinition {
  name: string;
  team: Team;
  maxHp: number;
  stats: BaseStats;
  spells: SpellDefinition[];
  automations: AutomationRule[];
  spawnPosition?: GridPosition;
}

// ─── Map / Graphe ──────────────────────────────────────────────
export enum NodeType {
  Combat = 'COMBAT',
  EliteCombat = 'ELITE',
  Boss = 'BOSS',
  Rest = 'REST',
  Event = 'EVENT',
  Shop = 'SHOP',
}

export interface MapNodeData {
  id: NodeId;
  type: NodeType;
  depth: number;       // profondeur dans le graphe (row)
  column: number;      // position horizontale
  children: NodeId[];  // noeuds accessibles après celui-ci
  completed: boolean;
  encounter?: EncounterData;
}

export interface EncounterData {
  enemies: EntityDefinition[];
  gridConfig: GridConfig;
}

export interface MapData {
  nodes: Map<NodeId, MapNodeData>;
  startNodeIds: NodeId[];
  bossNodeId: NodeId;
  currentNodeId: NodeId | null;
}

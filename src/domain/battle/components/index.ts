import type {
  EntityId,
  GridPosition,
  BaseStats,
  SpellDefinition,
  AutomationRule,
  ActiveStatusEffect,
  Team,
  SpellId,
} from '@domain/shared/types';

// ─── Health ────────────────────────────────────────────────────
export interface HealthComponent {
  current: number;
  max: number;
}

// ─── Position sur la grille ────────────────────────────────────
export interface PositionComponent {
  x: number;
  y: number;
}

// ─── Stats ─────────────────────────────────────────────────────
export interface StatsComponent extends BaseStats {}

// ─── Sorts équipés ─────────────────────────────────────────────
export interface SpellsComponent {
  spells: SpellDefinition[];
  cooldowns: Map<SpellId, number>; // tours restants avant réutilisation
}

// ─── Automatismes ordonnés ─────────────────────────────────────
export interface AutomationsComponent {
  rules: AutomationRule[];
}

// ─── Effets de statut actifs ───────────────────────────────────
export interface StatusEffectsComponent {
  effects: ActiveStatusEffect[];
}

// ─── Entité complète (agrégat ECS léger) ───────────────────────
export interface BattleEntity {
  id: EntityId;
  name: string;
  team: Team;
  health: HealthComponent;
  position: PositionComponent;
  stats: StatsComponent;
  spells: SpellsComponent;
  automations: AutomationsComponent;
  statusEffects: StatusEffectsComponent;
  isAlive: boolean;
}

// ─── Factory ───────────────────────────────────────────────────
export function createBattleEntity(
  id: EntityId,
  name: string,
  team: Team,
  maxHp: number,
  stats: BaseStats,
  spells: SpellDefinition[],
  automations: AutomationRule[],
  position: GridPosition,
): BattleEntity {
  return {
    id,
    name,
    team,
    health: { current: maxHp, max: maxHp },
    position: { ...position },
    stats: { ...stats },
    spells: {
      spells: [...spells],
      cooldowns: new Map(),
    },
    automations: {
      rules: [...automations].sort((a, b) => a.priority - b.priority),
    },
    statusEffects: { effects: [] },
    isAlive: true,
  };
}

import type {
  EntityId,
  GridPosition,
  SpellId,
  ActiveStatusEffect,
  Team,
} from '@domain/shared/types';

// ─── Union type de tous les events ─────────────────────────────

export type BattleEvent =
  | BattleStartedEvent
  | TurnStartedEvent
  | EntityMovedEvent
  | SpellCastEvent
  | DamageTakenEvent
  | HealReceivedEvent
  | StatusAppliedEvent
  | StatusExpiredEvent
  | StatusTickedEvent
  | CooldownTickedEvent
  | EntityDiedEvent
  | TurnEndedEvent
  | BattleEndedEvent;

// ─── Events individuels ────────────────────────────────────────

export interface BattleStartedEvent {
  type: 'BATTLE_STARTED';
  timestamp: number;
  entityIds: EntityId[];
}

export interface TurnStartedEvent {
  type: 'TURN_STARTED';
  timestamp: number;
  turnNumber: number;
  activeEntityId: EntityId;
}

export interface EntityMovedEvent {
  type: 'ENTITY_MOVED';
  timestamp: number;
  entityId: EntityId;
  from: GridPosition;
  to: GridPosition;
  path: GridPosition[]; // chemin complet pour l'animation
}

export interface SpellCastEvent {
  type: 'SPELL_CAST';
  timestamp: number;
  casterId: EntityId;
  spellId: SpellId;
  targetIds: EntityId[];
  targetPosition: GridPosition;
}

export interface DamageTakenEvent {
  type: 'DAMAGE_TAKEN';
  timestamp: number;
  targetId: EntityId;
  sourceId: EntityId;
  amount: number;
  remainingHp: number;
  isCritical: boolean;
}

export interface HealReceivedEvent {
  type: 'HEAL_RECEIVED';
  timestamp: number;
  targetId: EntityId;
  sourceId: EntityId;
  amount: number;
  remainingHp: number;
}

export interface StatusAppliedEvent {
  type: 'STATUS_APPLIED';
  timestamp: number;
  targetId: EntityId;
  sourceId: EntityId;
  effect: ActiveStatusEffect;
}

export interface StatusExpiredEvent {
  type: 'STATUS_EXPIRED';
  timestamp: number;
  targetId: EntityId;
  effect: ActiveStatusEffect;
}

export interface StatusTickedEvent {
  type: 'STATUS_TICKED';
  timestamp: number;
  targetId: EntityId;
  effect: ActiveStatusEffect;
  damageOrHeal: number;
}

export interface CooldownTickedEvent {
  type: 'COOLDOWN_TICKED';
  timestamp: number;
  entityId: EntityId;
  spellId: SpellId;
  remainingCooldown: number;
}

export interface EntityDiedEvent {
  type: 'ENTITY_DIED';
  timestamp: number;
  entityId: EntityId;
  killerId: EntityId;
}

export interface TurnEndedEvent {
  type: 'TURN_ENDED';
  timestamp: number;
  turnNumber: number;
  entityId: EntityId;
}

export interface BattleEndedEvent {
  type: 'BATTLE_ENDED';
  timestamp: number;
  winnerTeam: Team;
}

// ─── Helper ────────────────────────────────────────────────────
export function createEvent<T extends BattleEvent>(
  event: Omit<T, 'timestamp'>,
): T {
  return { ...event, timestamp: Date.now() } as T;
}

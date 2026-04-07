import type { EntityId, GridConfig, Team } from '@domain/shared/types';
import type { BattleEntity } from '@domain/battle/components';
import type { BattleEvent } from '@domain/battle/events/BattleEvent';

export interface BattleState {
  entities: Map<EntityId, BattleEntity>;
  grid: GridConfig;
  turnOrder: EntityId[];
  currentTurnIndex: number;
  turnNumber: number;
  eventLog: BattleEvent[];
  phase: BattlePhase;
}

export enum BattlePhase {
  NotStarted = 'NOT_STARTED',
  TurnStart = 'TURN_START',
  Execution = 'EXECUTION',
  TurnEnd = 'TURN_END',
  VictoryCheck = 'VICTORY_CHECK',
  Ended = 'ENDED',
}

export function createInitialBattleState(
  entities: BattleEntity[],
  grid: GridConfig,
): BattleState {
  const entityMap = new Map<EntityId, BattleEntity>();
  for (const e of entities) {
    entityMap.set(e.id, e);
  }
  return {
    entities: entityMap,
    grid,
    turnOrder: [],
    currentTurnIndex: 0,
    turnNumber: 0,
    eventLog: [],
    phase: BattlePhase.NotStarted,
  };
}

// ─── Helpers de lecture ────────────────────────────────────────
export function getAliveEntities(state: BattleState): BattleEntity[] {
  return [...state.entities.values()].filter((e) => e.isAlive);
}

export function getEntitiesByTeam(
  state: BattleState,
  team: Team,
): BattleEntity[] {
  return getAliveEntities(state).filter((e) => e.team === team);
}

export function getCurrentEntity(state: BattleState): BattleEntity | null {
  const id = state.turnOrder[state.currentTurnIndex];
  if (!id) return null;
  return state.entities.get(id) ?? null;
}

export function isTeamWiped(state: BattleState, team: Team): boolean {
  return getEntitiesByTeam(state, team).length === 0;
}

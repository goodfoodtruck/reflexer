import type { Dimensions, FightSnapshot, PlayingEntityID, Position } from "@reflexer/engine"
import type { CombatLogLine, CombatViewState, EntityView } from "./combat-view.types"

export const INITIAL_COMBAT_VIEW_STATE: CombatViewState = {
    entities: {},
    mapDimensions: null,
    turnIndex: 0,
    currentTurnOwnerId: null,
    upcomingTurnOwners: [],
    currentAction: null,
    logs: [],
    status: "idle",
}

/**
 * Actions émises par le `CombatReplayer` au fil de la lecture. Le replayer reste
 * impératif (boucle async hors React) et ne fait que `dispatch` ; le reducer
 * concentre toutes les transitions de l'état de vue.
 */
export type CombatAction =
    | { type: "initialize"; snapshot: FightSnapshot; labels: Map<PlayingEntityID, string>; mapDimensions: Dimensions }
    | { type: "beginTurn"; turnIndex: number; ownerId: PlayingEntityID; upcomingTurnOwners: PlayingEntityID[] }
    | { type: "pushAction"; line: CombatLogLine }
    | { type: "applyDamage"; targetId: PlayingEntityID; amount: number }
    | { type: "killEntity"; entityId: PlayingEntityID }
    | { type: "moveEntity"; entityId: PlayingEntityID; position: Position }
    | { type: "finish" }

export function combatViewReducer(state: CombatViewState, action: CombatAction): CombatViewState {
    switch (action.type) {
        case "initialize": {
            const entities: Record<PlayingEntityID, EntityView> = {}
            for (const entity of action.snapshot.entities) {
                entities[entity.id] = {
                    id: entity.id,
                    label: action.labels.get(entity.id) ?? entity.id,
                    teamId: entity.teamId,
                    position: entity.position,
                    hp: entity.currentStats.health,
                    maxHp: entity.currentStats.health,
                    energy: entity.currentStats.energy,
                    maxEnergy: entity.currentStats.energy,
                    alive: true,
                }
            }
            return { ...INITIAL_COMBAT_VIEW_STATE, entities, mapDimensions: action.mapDimensions, status: "playing" }
        }

        case "beginTurn":
            return {
                ...state,
                turnIndex: action.turnIndex,
                currentTurnOwnerId: action.ownerId,
                upcomingTurnOwners: action.upcomingTurnOwners,
            }

        case "pushAction":
            return { ...state, currentAction: action.line, logs: [...state.logs, action.line] }

        case "applyDamage":
            return patchEntity(state, action.targetId, entity => ({ hp: Math.max(0, entity.hp - action.amount) }))

        case "killEntity":
            return patchEntity(state, action.entityId, () => ({ alive: false, hp: 0 }))

        case "moveEntity":
            return patchEntity(state, action.entityId, () => ({ position: action.position }))

        case "finish":
            return { ...state, status: "ended", currentAction: null }
    }
}

function patchEntity(
    state: CombatViewState,
    entityId: PlayingEntityID,
    patch: (entity: EntityView) => Partial<EntityView>
): CombatViewState {
    const entity = state.entities[entityId]
    if (!entity) return state
    return {
        ...state,
        entities: { ...state.entities, [entityId]: { ...entity, ...patch(entity) } },
    }
}

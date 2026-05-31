import type { Dimensions, FightSnapshot, PlayingEntityID, Position } from "@reflexer/engine"
import type { CombatLogLine, CombatViewState, EntityView } from "./combat-view.types"

const INITIAL_STATE: CombatViewState = {
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
 * Source de vérité observable de l'écran de combat, alimentée pas à pas par le
 * `CombatReplayer` au fil de la lecture, et consommée par React via
 * `useSyncExternalStore` (cf. `use-combat-replay.hook.ts`).
 */
export class CombatViewStore {
    private state: CombatViewState = INITIAL_STATE
    private readonly listeners = new Set<() => void>()

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    getSnapshot = (): CombatViewState => this.state

    private setState(patch: Partial<CombatViewState>): void {
        this.state = { ...this.state, ...patch }
        this.listeners.forEach(listener => listener())
    }

    initialize(snapshot: FightSnapshot, labels: Map<PlayingEntityID, string>, mapDimensions: Dimensions): void {
        const entities: Record<PlayingEntityID, EntityView> = {}
        for (const entity of snapshot.entities) {
            entities[entity.id] = {
                id: entity.id,
                label: labels.get(entity.id) ?? entity.id,
                teamId: entity.teamId,
                position: entity.position,
                hp: entity.currentStats.health,
                maxHp: entity.currentStats.health,
                energy: entity.currentStats.energy,
                maxEnergy: entity.currentStats.energy,
                alive: true,
            }
        }
        this.setState({ ...INITIAL_STATE, entities, mapDimensions, status: "playing" })
    }

    beginTurn(turnIndex: number, ownerId: PlayingEntityID, upcomingTurnOwners: PlayingEntityID[]): void {
        this.setState({ turnIndex, currentTurnOwnerId: ownerId, upcomingTurnOwners })
    }

    pushAction(line: CombatLogLine): void {
        this.setState({ currentAction: line, logs: [...this.state.logs, line] })
    }

    applyDamage(targetId: PlayingEntityID, amount: number): void {
        this.patchEntity(targetId, entity => ({ hp: Math.max(0, entity.hp - amount) }))
    }

    killEntity(entityId: PlayingEntityID): void {
        this.patchEntity(entityId, () => ({ alive: false, hp: 0 }))
    }

    moveEntity(entityId: PlayingEntityID, position: Position): void {
        this.patchEntity(entityId, () => ({ position }))
    }

    finish(): void {
        this.setState({ status: "ended", currentAction: null })
    }

    private patchEntity(entityId: PlayingEntityID, patch: (entity: EntityView) => Partial<EntityView>): void {
        const entity = this.state.entities[entityId]
        if (!entity) return
        this.setState({
            entities: { ...this.state.entities, [entityId]: { ...entity, ...patch(entity) } },
        })
    }
}

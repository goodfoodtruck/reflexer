import { Action, ActionID } from '@fight/fight.types'
import { IActionRegistry } from './IActionRegistry'

export class InMemoryActionRegistry implements IActionRegistry {
    private readonly actions: ReadonlyMap<ActionID, Action>

    constructor(actions: readonly Action[]) {
        const entries: [ActionID, Action][] = actions.map(a => [a.id, a])

        if (entries.length !== new Set(entries.map(([id]) => id)).size) {
            throw new Error('InMemoryActionRegistry: duplicate action IDs detected')
        }

        this.actions = new Map(entries)
    }

    get(actionId: ActionID): Action {
        const action = this.actions.get(actionId)
        if (!action) {
            throw new Error(`Action inconnue : ${actionId}`)
        }
        return action
    }
}
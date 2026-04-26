import { Action, ActionID } from '@fight/fight.types'

export interface IActionRegistry {
    get(actionId: ActionID): Action
}
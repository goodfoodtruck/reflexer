import {Action, ActionID} from "@fight/fight.types";

export class ActionRegistry {
    private actions: Map<ActionID, Action>;

    constructor(actions: Action[]) {
        this.actions = new Map(actions.map(a => [a.id, a]));
    }

    get(actionId: string): Action {
        const action = this.actions.get(actionId);
        if (!action) throw new Error(`Action inconnue : ${actionId}`);
        return action;
    }
}

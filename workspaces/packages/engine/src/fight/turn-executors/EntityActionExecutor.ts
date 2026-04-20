import { ActionLog } from "@fight/fight.types"
import { FightContext } from "@fight/context/FightContext"
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { ActionRegistry } from "@data/ActionRegistry";
import { ProcessorChain } from "@processors/ProcessorChain";

export class EntityActionExecutor {
    constructor(
        private readonly actionRegistry: ActionRegistry,
        private readonly processorChain: ProcessorChain
    ) {}

    execute(ctx: ExecutionContext, fightContext: FightContext): ActionLog[] {
        const action = this.actionRegistry.get(ctx.actionId);
        return this.processorChain.execute(ctx, action.processorConfigs, fightContext);
    }
}
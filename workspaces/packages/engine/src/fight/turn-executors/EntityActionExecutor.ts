import { ActionLog, ExecutionContext } from "@fight/fight.types"
import { FightContext } from "@fight/context/FightContext"
import { IActionRegistry } from "@data/IActionRegistry";
import { ProcessorChain } from "@processors/ProcessorChain";
import { ProcessorFactory } from "@processors/ProcessorFactory";

export class EntityActionExecutor {
    constructor(
        private readonly actionRegistry: IActionRegistry,
        private readonly processorChain: ProcessorChain
    ) {}

    execute(ctx: ExecutionContext, fightContext: FightContext): ActionLog[] {
        const action = this.actionRegistry.get(ctx.actionId);

        const processors = [...action.processorConfigs]
            .sort((a, b) => a.order - b.order)
            .map(config => ProcessorFactory.create(config));

        return this.processorChain.execute(ctx, processors, fightContext);
    }
}
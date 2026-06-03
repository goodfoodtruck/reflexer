import { ActionExecutionContext, ExecutionState, IFightContextReader } from "@fight/fight.types";
import { manhattanDistance } from "@helpers/map/utils";
import { IProcessor } from "@processors/IProcessor";
import { CheckRangeProcessorParams, ProcessorResult } from "@processors/processor.types";

export class CheckRangeProcessor implements IProcessor {

    constructor(
        private readonly params: CheckRangeProcessorParams
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState, 
        fightContext: IFightContextReader
    ): ProcessorResult {
        const caster = fightContext.getEntityById(ctx.casterId)
        const target = fightContext.getEntityById(ctx.targetId)

        if (! caster || ! target) return { status: "aborted", reason: "entity_not_found" }

        const distance = manhattanDistance(caster.position, target.position)

        if (distance > this.params.range) return { status: "aborted", reason: "out_of_range" }

        return { 
            status: "ok", 
            derivedContexts: [] 
        }
    }
}
import { ActionExecutionContext, ExecutionState, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { ActionLineOfSightProcessorParams, ProcessorResult } from "@processors/processor.types";

export class ActionLineOfSightProcessor implements IProcessor {

    constructor(
        private readonly params: ActionLineOfSightProcessorParams
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        execState: ExecutionState, 
        fightContext: IFightContextReader
    ): ProcessorResult {
        const caster = fightContext.getEntityById(ctx.casterId)
        const target = fightContext.getEntityById(ctx.targetId)
        const hasLineOfSight = fightContext.getMap().hasLineOfSight

        if (! caster || ! target) return { status: "aborted", reason: "entity_not_found" }

        if (! hasLineOfSight(caster.position, target.position))
            return { status: "aborted", reason: "line_of_sight_blocked" }

        return { 
            status: "ok", 
            derivedContexts: []
        }
    }
}
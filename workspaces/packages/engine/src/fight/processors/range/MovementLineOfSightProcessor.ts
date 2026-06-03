import { ExecutionState, IFightContextReader, MovementExecutionContext } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { MovementLineOfSightProcessorParams, ProcessorResult } from "@processors/processor.types";

export class MovementLineOfSightProcessor implements IProcessor {

    constructor(
        private readonly params: MovementLineOfSightProcessorParams
    ) {}

    execute(
        ctx: MovementExecutionContext, 
        execState: ExecutionState, 
        fightContext: IFightContextReader
    ): ProcessorResult {
        const caster = fightContext.getEntityById(ctx.casterId)
        const hasLineOfSight = fightContext.getMap().hasLineOfSight

        if (! caster) return { status: "aborted", reason: "entity_not_found" }

        if (! hasLineOfSight(caster.position, ctx.targetCell))
            return { status: "aborted", reason: "line_of_sight_blocked" }

        return { 
            status: "ok", 
            derivedContexts: []
        }
    }
}
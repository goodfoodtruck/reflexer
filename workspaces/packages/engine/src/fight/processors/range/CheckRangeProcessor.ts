import { ExecutionContext, ExecutionState, IFightContextReader } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { CheckRangeProcessorParams, ProcessorResult } from "@processors/processor.types";

export class CheckRangeProcessor implements IProcessor {

    constructor(
        private readonly params: CheckRangeProcessorParams
    ) {}

    execute(
        ctx: ExecutionContext, 
        execState: ExecutionState, 
        fightContext: IFightContextReader
    ): ProcessorResult {
        throw new Error("Method not implemented.");
    }
}
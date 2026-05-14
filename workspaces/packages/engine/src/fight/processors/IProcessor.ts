import { ExecutionContext } from "@fight/fight.types";
import { ProcessorResult } from "@processors/processor.types";
import { IFightContextMutator } from "@fight/context/IFightContextMutator";
import { IFightContextReader } from "@fight/context/IFightContextReader";

export interface IProcessor {
    execute(
        ctx: ExecutionContext,
        snapshot: IFightContextMutator & IFightContextReader
    ): ProcessorResult;
}
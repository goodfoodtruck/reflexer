import { ExecutionContext } from "@fight/fight.types";
import { ProcessorResult } from "@processors/processor.types";
import { IFightContextMutator } from "@fight/fight.types";
import { IFightContextReader } from "@fight/fight.types";

export interface IProcessor {
    execute(
        ctx: ExecutionContext,
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult;
}
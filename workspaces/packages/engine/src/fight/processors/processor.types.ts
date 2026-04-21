import { ActionLog } from "@fight/fight.types";
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { IProcessor } from "@processors/IProcessor";

export type DamageParams = { damage_value: number }

interface BaseProcessorConfig {
    order: number
}

export type ProcessorConfig =
    | (BaseProcessorConfig & { processorId: 'damage'; params: DamageParams })

export type QueuedProcessor = {
    processor: Readonly<IProcessor>;
    context: Readonly<ExecutionContext>;
}

export type ProcessorResult =
    | { status: 'ok'; logs: ActionLog[] }
    | { status: 'aborted'; reason: string; logs: ActionLog[] }
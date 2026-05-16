import { ActionLog, ExecutionContext } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { Position } from "@helpers/types/helpers.types";

export type DamageParams = { damage_value: number }
export type WalkParams = { cell: Position }

export type ProcessorParams =
    | DamageParams
    | WalkParams

export type ProcessorType =
    | 'damage'
    | 'walk'

export type ProcessorConfig = {
    type: ProcessorType;
    order: number;
    params: ProcessorParams;
}

export type QueuedProcessor = {
    processor: Readonly<IProcessor>;
    context: Readonly<ExecutionContext>;
}

export type ProcessorResult =
    | { status: 'ok'; logs: ActionLog[] }
    | { status: 'aborted'; reason: string; logs: ActionLog[] }
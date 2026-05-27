import { ActionLog, ExecutionContext } from "@fight/fight.types";
import { IProcessor } from "@processors/IProcessor";
import { Position } from "@helpers/types/helpers.types";
import { PassiveConfigID } from "@fight/passives/passives.types";

export type DamageParams = { damage_value: number }
export type WalkParams = { cell: Position }
export type PassiveParams = { passiveConfigId: PassiveConfigID, duration: number | "PERMANENT" }

export type ProcessorParams =
    | DamageParams
    | WalkParams
    | PassiveParams

export type ProcessorType =
    | 'damage'
    | 'walk'
    | 'passive'

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
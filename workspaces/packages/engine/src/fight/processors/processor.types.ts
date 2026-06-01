import { ExecutionContext } from "@fight/fight.types";
import { Position } from "@helpers/types/helpers.types";
import { PassiveID } from "@fight/passives/passives.types";

export type DamageParams = { damage_value: number }
export type WalkParams = { cell: Position }
export type PassiveParams = { passiveId: PassiveID, duration: number | "PERMANENT" }

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

export type ProcessorResult =
    | { status: 'ok', derivedContexts: ExecutionContext[] }
    | { status: 'aborted'; reason: string }
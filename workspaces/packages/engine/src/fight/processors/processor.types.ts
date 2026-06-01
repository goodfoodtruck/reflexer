import { ActionID, AreaCenter, AreaType, ExecutionContext } from "@fight/fight.types";
import { Position } from "@helpers/types/helpers.types";
import { PassiveID } from "@fight/passives/passives.types";

export type DamageProcessorParams = { readonly damageValue: number }
export type WalkProcessorParams = { readonly cell: Position }
export type PassiveProcessorParams = { 
    readonly passiveId: PassiveID, 
    readonly duration: number | "PERMANENT" 
}
export type UseEnergyProcessorParams = { readonly energyAmount: number }
export type CheckEnergyProcessorParams = { readonly neededEnergy: number }
export type AreaProcessorParams = {
    readonly areaType: AreaType,
    readonly areaCenter: AreaCenter,
    readonly areaSize: number,
    readonly derivedActionId: ActionID
}


export type ProcessorParams =
    | DamageProcessorParams
    | WalkProcessorParams
    | PassiveProcessorParams
    | UseEnergyProcessorParams
    | CheckEnergyProcessorParams
    | AreaProcessorParams

export type ProcessorType =
    | 'damage'
    | 'walk'
    | 'passive'
    | 'area'
    | 'use_energy'
    | 'check_energy'

export type ProcessorConfig = {
    type: ProcessorType;
    order: number;
    params: ProcessorParams;
}

export type ProcessorResult =
    | { status: 'ok', derivedContexts: ExecutionContext[] }
    | { status: 'aborted'; reason: string }
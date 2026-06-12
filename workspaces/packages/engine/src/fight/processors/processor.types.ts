import { ActionID, AreaCenter, AreaType, EActionRange, ExecutionContext } from "@fight/fight.types";
import { Position } from "@helpers/types/helpers.types";
import { PassiveID } from "@fight/passives/passives.types";

export type WalkProcessorParams = { readonly cell: Position }

export type PassiveProcessorParams = { 
    readonly passiveId: PassiveID, 
    readonly duration: number | "PERMANENT" 
}
export type UseEnergyProcessorParams = {}
export type CheckEnergyProcessorParams = { readonly neededEnergy: number }

export type AreaProcessorParams = {
    readonly areaType: AreaType,
    readonly areaCenter: AreaCenter,
    readonly areaSize: number,
    readonly derivedActionId: ActionID
}

export type ArmorComputeProcessorParams = {}

export type ApplyDamageProcessorParams = {}
export type ComputeDamageProcessorParams = { readonly initialDamage: number }

export type ComputeHealProcessorParams = { readonly healAmount: number }
export type ApplyHealProcessorParams = {}
export type CheckRangeProcessorParams = { readonly range: EActionRange }
export type ActionLineOfSightProcessorParams = {}
export type MovementLineOfSightProcessorParams = {}

export type ProcessorParams =
    | ApplyDamageProcessorParams
    | ComputeDamageProcessorParams
    | WalkProcessorParams
    | PassiveProcessorParams
    | UseEnergyProcessorParams
    | CheckEnergyProcessorParams
    | AreaProcessorParams
    | ComputeHealProcessorParams
    | ApplyHealProcessorParams
    | CheckRangeProcessorParams
    | MovementLineOfSightProcessorParams
    | ActionLineOfSightProcessorParams

export type ProcessorType =
    | 'compute_damage'
    | 'apply_damage'
    | 'walk'
    | 'passive'
    | 'area'
    | 'use_energy'
    | 'check_energy'
    | 'compute_armor'
    | 'compute_heal'
    | 'apply_heal'
    | 'check_range'
    | 'action_line_of_sight'
    | 'movement_line_of_sight'

export type ProcessorConfig = {
    type: ProcessorType;
    order: number;
    params: ProcessorParams;
}

export type ProcessorResult =
    | { status: 'ok', derivedContexts: ExecutionContext[] }
    | { status: 'aborted'; reason: string }
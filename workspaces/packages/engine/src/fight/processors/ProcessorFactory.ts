import { ActionLineOfSightProcessorParams, ApplyDamageProcessorParams, ApplyHealProcessorParams, AreaProcessorParams, ArmorComputeProcessorParams, CheckEnergyProcessorParams, CheckRangeProcessorParams, ComputeDamageProcessorParams, ComputeHealProcessorParams, MovementLineOfSightProcessorParams, PassiveProcessorParams, ProcessorConfig, UseEnergyProcessorParams } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";
import { WalkProcessor } from "@fight/processors/move/WalkProcessor";
import { IPassiveRegistry } from "@data/IPassiveRegistry";
import { AreaProcessor } from "@processors/area/AreaProcessor";
import { CheckEnergyProcessor } from "@processors/energy/CheckEnergyProcessor";
import { UseEnergyProcessor } from "@processors/energy/UseEnergyProcessor";
import { DamageApplyProcessor } from "@processors/damage/DamageApplyProcessor";
import { DamageComputeProcessor } from "@processors/damage/DamageComputeProcessor";
import { CheckRangeProcessor } from "@processors/range/CheckRangeProcessor";
import { PassiveApplierProcessor } from "@processors/passive/PassiveApplierProcessor";
import { ArmorComputeProcessor } from "@processors/armor/ArmorComputeProcessor";
import { HealApplyProcessor } from "@processors/heal/HealApplyProcessor";
import { HealComputeProcessor } from "@processors/heal/HealComputeProcessor";
import { ActionLineOfSightProcessor } from "@processors/range/ActionLineOfSightProcessor";
import { MovementLineOfSightProcessor } from "@processors/range/MovementLineOfSightProcessor";

export class ProcessorFactory {

    constructor(private readonly passiveRegistry: IPassiveRegistry) {}

    create(config: ProcessorConfig): IProcessor {
        switch (config.type) {
            case "apply_damage":   return new DamageApplyProcessor(config.params as ApplyDamageProcessorParams)
            case "compute_damage": return new DamageComputeProcessor(config.params as ComputeDamageProcessorParams)
            case "walk":           return new WalkProcessor()
            case "passive":        return new PassiveApplierProcessor(this.passiveRegistry, config.params as PassiveProcessorParams)
            case "area":           return new AreaProcessor(config.params as AreaProcessorParams)
            case "check_energy":   return new CheckEnergyProcessor(config.params as CheckEnergyProcessorParams)
            case "use_energy":     return new UseEnergyProcessor(config.params as UseEnergyProcessorParams)
            case "compute_heal":   return new HealComputeProcessor(config.params as ComputeHealProcessorParams)
            case "apply_heal":     return new HealApplyProcessor(config.params as ApplyHealProcessorParams)
            case "compute_armor":  throw new Error("Not implemented.")
            case "check_range":    return new CheckRangeProcessor(config.params as CheckRangeProcessorParams)
            case "compute_armor":  return new ArmorComputeProcessor(config.params as ArmorComputeProcessorParams)
            case "action_line_of_sight": return new ActionLineOfSightProcessor(config.params as ActionLineOfSightProcessorParams)
            case "movement_line_of_sight": return new MovementLineOfSightProcessor(config.params as MovementLineOfSightProcessorParams)
        }
    }
}
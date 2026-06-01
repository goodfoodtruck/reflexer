import { AreaProcessorParams, CheckEnergyProcessorParams, DamageProcessorParams, PassiveProcessorParams, ProcessorConfig, UseEnergyProcessorParams } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";
import { DamageProcessor } from "@processors/DamageProcessor";
import { WalkProcessor } from "@processors/WalkProcessor";
import { PassiveApplierProcessor } from "./PassiveApplierProcessor";
import { IPassiveRegistry } from "@data/IPassiveRegistry";
import { AreaProcessor } from "./AreaProcessor";
import { CheckEnergyProcessor } from "./energy/CheckEnergyProcessor";
import { UseEnergyProcessor } from "./energy/UseEnergyProcessor";

export class ProcessorFactory {

    constructor(private readonly passiveRegistry: IPassiveRegistry) {}

    create(config: ProcessorConfig): IProcessor {
        switch (config.type) {
            case "damage":       return new DamageProcessor(config.params as DamageProcessorParams)
            case "walk":         return new WalkProcessor()
            case "passive":      return new PassiveApplierProcessor(this.passiveRegistry, config.params as PassiveProcessorParams)
            case "area":         return new AreaProcessor(config.params as AreaProcessorParams)
            case "check_energy": return new CheckEnergyProcessor(config.params as CheckEnergyProcessorParams)
            case "use_energy":   return new UseEnergyProcessor(config.params as UseEnergyProcessorParams)
        }
    }
}
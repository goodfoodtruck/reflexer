import { DamageParams, PassiveParams, ProcessorConfig, WalkParams } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";
import { DamageProcessor } from "@processors/DamageProcessor";
import { WalkProcessor } from "@processors/WalkProcessor";
import { PassiveApplierProcessor } from "./PassiveApplierProcessor";
import { IPassiveRegistry } from "@data/IPassiveRegistry";

export class ProcessorFactory {

    constructor(
        private readonly passiveRegistry: IPassiveRegistry
    ) {}

    create(config: ProcessorConfig): IProcessor {
        switch (config.type) {
            case "damage":  return new DamageProcessor((config.params as DamageParams).damage_value)
            case "walk":    return new WalkProcessor()
            case "passive": return new PassiveApplierProcessor(
                this.passiveRegistry,
                (config.params as PassiveParams).passiveId,
                (config.params as PassiveParams).duration
            )
        }
    }
}
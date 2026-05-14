import { DamageParams, ProcessorConfig, WalkParams } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";
import { DamageProcessor } from "@processors/DamageProcessor";
import { WalkProcessor } from "@processors/WalkProcessor";

export class ProcessorFactory {
    static create(config: ProcessorConfig): IProcessor {
        switch (config.type) {
            case "damage": return new DamageProcessor((config.params as DamageParams).damage_value)
            case "walk":   return new WalkProcessor((config.params as WalkParams).cell)
        }
    }
}
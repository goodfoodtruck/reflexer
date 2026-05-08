import { DamageParams, ProcessorConfig } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";
import { DamageProcessor } from "@processors/DamageProcessor";

export class ProcessorFactory {
    private static readonly builders = {
        damage: (params: DamageParams) => new DamageProcessor(params.damage_value),
    }

    static create(config: ProcessorConfig): IProcessor {
        const builder = this.builders[config.type];
        if (!builder) throw new Error(`Processor inconnu : ${config.type}`);
        return builder(config.params);
    }
}
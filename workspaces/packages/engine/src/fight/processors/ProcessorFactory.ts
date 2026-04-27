import { ProcessorConfig } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";
import { DamageProcessor } from "@processors/DamageProcessor";

type ProcessorBuilder<C extends ProcessorConfig> = (params: C['params']) => IProcessor;

export class ProcessorFactory {
    private static readonly builders: {
        [K in ProcessorConfig['processorId']]: ProcessorBuilder<Extract<ProcessorConfig, { processorId: K }>>
    } = {
        damage: (params) => new DamageProcessor(params.damage_value)
    }

    static create(config: ProcessorConfig): IProcessor {
        const builder = this.builders[config.processorId] as ProcessorBuilder<typeof config>
        if (!builder) throw new Error(`Processor inconnu : ${config.processorId}`)
        return builder(config.params)
    }
}
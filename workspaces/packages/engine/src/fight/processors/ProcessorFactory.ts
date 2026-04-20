import { DamageProcessor } from "@processors/DamageProcessor";
import { CheckEnergyProcessor } from "@processors/CheckEnergyProcessor";
import { ProcessorId } from "@processors/processor.types";
import { IProcessor } from "@processors/IProcessor";

export class ProcessorFactory {
    private static readonly map: Record<ProcessorId, () => IProcessor> = {
        check_energy: () => new CheckEnergyProcessor(),
        damage:     () => new DamageProcessor(),
    }

    static create(id: ProcessorId): IProcessor {
        const factory = this.map[id];
        if (!factory) throw new Error(`Processor inconnu : ${id}`);
        return factory();
    }
}
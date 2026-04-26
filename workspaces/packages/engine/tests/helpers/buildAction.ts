import {ProcessorConfig} from "@fight/processors/processor.types";
import {Action, ActionCategory, ActionID} from "@fight/fight.types";

interface BuildActionOptions {
    id: string
    type?: ActionCategory
    configs: Omit<ProcessorConfig, 'order'>[]
}

export function buildAction(opts: BuildActionOptions): Action {
    return {
        id: opts.id as ActionID,
        type: opts.type ?? ('attack' as ActionCategory),
        processorConfigs: opts.configs.map((config, index) => ({
            ...config,
            order: index,
        })) as ProcessorConfig[],
    }
}
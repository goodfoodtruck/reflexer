import { FightContext } from "@fight/context/FightContext";
import { ActionLog } from "@fight/fight.types";

export type ProcessorParamsKey = "energy_cost"
                               | "damage_value";

export type ProcessorParamsValue = number;

export type ProcessorParams = Record<ProcessorParamsKey, ProcessorParamsValue>

export type ProcessorResult =
    | { status: 'ok'; logs: ActionLog[] }
    | { status: 'aborted'; reason: string; logs: ActionLog[] }

export type ProcessorId = "check_energy"
                        | "damage";

export type ProcessorConfig = {
    processorId: ProcessorId;
    order: number;
    params: ProcessorParams;
};
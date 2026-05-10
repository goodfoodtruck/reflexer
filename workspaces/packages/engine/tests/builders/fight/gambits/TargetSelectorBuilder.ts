import {ETargetType, TargetSelector, TargetSort} from "@gambits/gambits.types";

export function buildTargetSelector(
    overrides: Partial<TargetSelector> = {}
): TargetSelector {
    return {
        context: { targetType: ETargetType.ENEMY, filters: [] },
        sort: "LOWEST_HP" as TargetSort,
        ...overrides
    }
}
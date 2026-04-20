import { Position } from "@helpers/types/helpers.types";

export type ExecutionContext = {
    casterId: Readonly<string>;
    actionId: Readonly<string>;
    targetCell: Readonly<Position>;
};
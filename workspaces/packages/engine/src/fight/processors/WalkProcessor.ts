import { IProcessor } from "@processors/IProcessor";
import { ExecutionContext } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { ProcessorResult } from "@processors/processor.types";
import { Position } from "@helpers/types/helpers.types";

export class WalkProcessor implements IProcessor {
    constructor(private readonly cell: Position) {}

    execute(context: ExecutionContext, fightContext: FightContext): ProcessorResult {
        const caster = fightContext.getAliveEntityOrThrow(context.casterId)

        if (!this.isAdjacent(caster.position, this.cell)){
            return { status: 'aborted', reason: 'cell_too_far', logs: [] }
        }

        try {
            fightContext.moveEntity(context.casterId, this.cell)

        } catch (err) {
            return { status: 'aborted', reason: 'move_failed', logs: [] }
        }

        return {
            status: 'ok',
            logs: [{ type: 'entity_moved', entityId: context.casterId, cell: this.cell }]
        }
    }

    private isAdjacent(from: Position, to: Position): boolean {
        const dx = Math.abs(from.x - to.x)
        const dy = Math.abs(from.y - to.y)
        return dx + dy === 1
    }
}
import { AreaType, ActionExecutionContext, IFightContextMutator, IFightContextReader, AreaCenter, ActionID } from "@fight/fight.types";
import { IProcessor } from "@fight/processors/IProcessor";
import { ProcessorResult } from "@fight/processors/processor.types";
import { getCellsInArea, isInArea } from "@helpers/processors/area/areaUtils";
import { Position } from "@helpers/types/helpers.types";

export class AreaProcessor implements IProcessor {

    constructor(
        private readonly areaType: AreaType,
        private readonly areaCenter: AreaCenter,
        private readonly areaSize: number,
        private readonly derivedActionId: ActionID
    ) {}

    execute(
        ctx: ActionExecutionContext, 
        fightContext: IFightContextMutator & IFightContextReader
    ): ProcessorResult {
        const centerPosition = this.resolveCenter(ctx, fightContext)
        if (! centerPosition) return { status: "aborted", reason: "center_target_not_found" }

        const cells = getCellsInArea(centerPosition, this.areaSize, this.areaType)
        const targets = fightContext.getEntitiesAtPositions(cells)

        // on retourne la même action, sans le AreaProcessor pour éviter 
        // une boucle infinie de réactions, pour chaque cible dans la zone
        const derivedContexts: ActionExecutionContext[] = targets.map(target => ({
            type: "action",
            casterId: ctx.casterId,
            targetId: target.id,
            actionId: this.derivedActionId,
            reactionDepth: ctx.reactionDepth
        }))

        return { status: "ok", derivedContexts }
    }

    private resolveCenter(
        ctx: ActionExecutionContext,
        fightContext: IFightContextMutator & IFightContextReader
    ): Position | null {
        switch (this.areaCenter.kind) {
            case "TARGET": return fightContext.getEntityById(ctx.targetId)?.position ?? null
            case "CASTER": return fightContext.getEntityById(ctx.casterId)?.position ?? null
        }
    }
}
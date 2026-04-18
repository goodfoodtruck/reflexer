import { IFightContextMutator } from "@fight/context/IFightContextMutator";
import { IFightContextReader } from "@fight/context/IFightContextReader";
import { PlayingEntity, ActionLog } from "@fight/fight.types";
import { MovementStrategy } from "@fight/gambits/gambits.types";

export class EntityMovementExecutor {
    execute(
        entity: PlayingEntity, 
        movementStrategy: MovementStrategy,
        fightContext: IFightContextMutator & IFightContextReader
    ): ActionLog[] {
        return []
    }
}
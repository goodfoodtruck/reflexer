import { IFightContextMutator } from "@fight/context/IFightContextMutator";
import { IFightContextReader } from "@fight/context/IFightContextReader";
import { PlayingEntity, ActionLog, ActionID } from "@fight/fight.types";

export class EntityActionExecutor {
    execute(
        entity: PlayingEntity, 
        actionId: ActionID,
        fightContext: IFightContextMutator & IFightContextReader
    ): ActionLog[] {
        return []
    }
}
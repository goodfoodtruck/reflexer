import { ActionLog, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";
import { PassiveTrigger } from "@fight/passives/passives.types";

export class EntityPassiveExecutor {
    
    constructor() {}

    executePassiveTrigger(
        trigger: PassiveTrigger,
        entity: PlayingEntity, 
        fightContext: FightContext
    ): ActionLog[] {
        return []
    }
}
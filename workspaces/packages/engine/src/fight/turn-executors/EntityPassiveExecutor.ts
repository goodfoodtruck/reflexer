import { ActionLog, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/context/FightContext";

export class EntityPassiveExecutor {
    constructor() {}

    executeEntityPassives(entity: PlayingEntity, fightContext: FightContext): ActionLog[] {
        return []
    }
}
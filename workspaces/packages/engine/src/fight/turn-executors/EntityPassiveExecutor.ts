import { ActionLog, PlayingEntity } from "@fight/fight.types";
import { FightContext } from "@fight/FightContext";

export class EntityPassiveExecutor {
    constructor() {}

    executeEntityPassives(entity: PlayingEntity, fightContext: FightContext): ActionLog[] {
        return []
    }
}
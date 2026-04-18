import { IFightContextReader } from "@fight/context/IFightContextReader";
import { ActionID, PlayingEntity } from "@fight/fight.types";

export class EntityActionResolver {
    
    resolve(entity: PlayingEntity, fightContext: IFightContextReader): ActionID | null {
        return "FIREBALL"
    }
}
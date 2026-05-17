import { IFightContextReader } from "@fight/fight.types";
import { MovementContext, PlayingEntity } from "@fight/fight.types";
import { Gambit } from "@fight/gambits/gambits.types";

export class EntityMovementResolver {
    
    resolve(entity: PlayingEntity, gambits: Gambit[], fightContext: IFightContextReader): MovementContext {
        return "APPROACH"
    }
}
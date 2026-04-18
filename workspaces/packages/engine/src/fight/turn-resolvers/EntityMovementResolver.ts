import { IFightContextReader } from "@fight/context/IFightContextReader";
import { PlayingEntity } from "@fight/fight.types";
import { MovementStrategy } from "@fight/gambits/gambits.types";

export class EntityMovementResolver {
    
    resolve(entity: PlayingEntity, fightContext: IFightContextReader): MovementStrategy | null {
        return "APPROACH"
    }
}
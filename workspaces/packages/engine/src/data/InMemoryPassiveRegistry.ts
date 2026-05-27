import { Passive, PassiveID } from "@fight/passives/passives.types";
import { IPassiveRegistry } from "./IPassiveRegistry";

export class InMemoryPassiveRegistry implements IPassiveRegistry {
    getPassive(passiveId: PassiveID): Passive {
        throw new Error("Method not implemented.");
    }
}
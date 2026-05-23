import { PassiveConfigID, Passive } from "@fight/passives/passives.types";
import { IPassiveRegistry } from "./IPassiveRegistry";

export class InMemoryPassiveRegistry implements IPassiveRegistry {
    getPassive(passiveConfigId: PassiveConfigID): Passive {
        throw new Error("Method not implemented.");
    }
}
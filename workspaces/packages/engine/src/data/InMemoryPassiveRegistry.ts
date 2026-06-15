import { Passive, PassiveID } from "@fight/passives/passives.types";
import { IPassiveRegistry } from "./IPassiveRegistry";

export class InMemoryPassiveRegistry implements IPassiveRegistry {
    constructor(private readonly passives: Record<PassiveID, Passive>) {}

    getPassive(passiveId: PassiveID): Passive {
        const passive = this.passives[passiveId]
        if (!passive) {
            throw new Error(`Passif inconnu : ${passiveId}`)
        }
        return passive
    }
}
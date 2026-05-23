import { Passive, PassiveConfigID } from "@fight/passives/passives.types";

export interface IPassiveRegistry {
    getPassive(passiveConfigId: PassiveConfigID): Passive
}
import { PassiveID, Passive } from "@fight/passives/passives.types";

export interface IPassiveRegistry {
    getPassive(passiveId: PassiveID): Passive
}
import { FightMapConfig, FightMapID } from "@fight/fight.types";

export interface IFightMapRegistry {
    getConfig(id: FightMapID): FightMapConfig;
}
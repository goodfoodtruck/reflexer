import { FightMapID, FightMapConfig } from "@fight/map/fight.map.types";

export interface IFightMapRegistry {
    getConfig(id: FightMapID): FightMapConfig;
}
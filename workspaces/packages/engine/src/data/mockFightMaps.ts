import { FightMapConfig, FightMapID } from "@fight/map/fight.map.types"
import mapsJson from "./json/maps.json"


export const MOCK_FIGHT_MAPS: readonly FightMapConfig[] = mapsJson as unknown as readonly FightMapConfig[]

/** Identifiants des cartes disponibles, dans l'ordre du catalogue. */
export const MOCK_FIGHT_MAP_IDS: readonly FightMapID[] = MOCK_FIGHT_MAPS.map(map => map.id)

/** Tire au hasard l'identifiant d'une carte du catalogue (combats sans choix explicite). */
export function pickRandomFightMapId(): FightMapID {
    const index = Math.floor(Math.random() * MOCK_FIGHT_MAP_IDS.length)
    return MOCK_FIGHT_MAP_IDS[index]!
}

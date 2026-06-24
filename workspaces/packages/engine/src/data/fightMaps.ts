import { FightMapConfig, FightMapID } from "@fight/map/fight.map.types"
import mapsJson from "./json/maps.json"


export const FIGHT_MAPS: readonly FightMapConfig[] = mapsJson as unknown as readonly FightMapConfig[]

/** Identifiants des cartes disponibles, dans l'ordre du catalogue. */
export const FIGHT_MAP_IDS: readonly FightMapID[] = FIGHT_MAPS.map(map => map.id)

/** Tire au hasard l'identifiant d'une carte du catalogue (combats sans choix explicite). */
export function pickRandomFightMapId(): FightMapID {
    const index = Math.floor(Math.random() * FIGHT_MAP_IDS.length)
    return FIGHT_MAP_IDS[index]!
}

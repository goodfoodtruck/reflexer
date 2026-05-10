import { EnemyTag } from "@fight/fight.types";
import { LONG_RANGE_MAP_COMPOSITIONS, MID_RANGE_MAP_COMPOSITIONS, SMALL_RANGE_MAP_COMPOSITIONS } from "@fight/map/enemy-composition-rules";
import { EFightMapSize } from "@fight/map/fight.map.types";
import { NbPlayerByTeam } from "@fight/value-objects/NbPlayerByTeam";

export class EnemyCompositionResolver {
    
   private readonly compositions: Record<EFightMapSize, Record<number, EnemyTag[]>> = {
        [EFightMapSize.SMALL_RANGE]: SMALL_RANGE_MAP_COMPOSITIONS,
        [EFightMapSize.MID_RANGE]:   MID_RANGE_MAP_COMPOSITIONS,
        [EFightMapSize.LONG_RANGE]:  LONG_RANGE_MAP_COMPOSITIONS,
    }

    resolve(mapSize: EFightMapSize, nbEnemies: NbPlayerByTeam): EnemyTag[] {
        const composition = this.compositions[mapSize][nbEnemies.value]
        if (! composition)
            throw new Error(`Aucune composition définie pour ${mapSize} avec ${nbEnemies} ennemis`)

        return composition
    }
}
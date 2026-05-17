import { INbEnemiesResolver } from "@fight/fight.types"
import { NbPlayerByTeam } from "@fight/value-objects/NbPlayerByTeam"

export class NbEnemiesResolver implements INbEnemiesResolver {

    resolve(floorIndex: number): NbPlayerByTeam {
        // ex: étage 1-3 → 2, étage 4-6 → 4, étage 7-10 → 6, étage 11+ → 8
        if (floorIndex <= 3)  return new NbPlayerByTeam(2)
        if (floorIndex <= 6)  return new NbPlayerByTeam(4)
        if (floorIndex <= 10) return new NbPlayerByTeam(6)
        return new NbPlayerByTeam(8)
    }
}
import { useMemo } from "react"
import type { BasePvpFight } from "../../../shared/types/fight.types"

export function useCurrentWinstreak(fights: BasePvpFight[], playerId: string): number {
    return useMemo(() => {
        let streak = 0

        for (const fight of [...fights].reverse()) {
            if (fight.winnerId === null) continue
            if (fight.winnerId !== playerId) break
            streak++
        }

        return streak
    }, [fights, playerId])
}
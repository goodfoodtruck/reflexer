import { useMemo } from "react"
import type { BasePvpFight } from "@shared/fight.types"

export type PlayerWinrate = {
    total: number
    wins: number
    losses: number
    winrate: number
    lossrate: number
}

export const usePlayerWinrate = (fights: BasePvpFight[], userId: string): PlayerWinrate => {
    return useMemo(() => {
        const total = fights.length
        if (total === 0) return { total: 0, wins: 0, losses: 0, winrate: 0, lossrate: 0 }

        let wins = 0
        let losses = 0

        for (const fight of fights) {
            fight.winnerId === userId ? wins++ : losses++
        }

        return {
            total,
            wins,
            losses,
            winrate:  Math.round((wins / total) * 100),
            lossrate: Math.round((losses / total) * 100)
        }
    }, [fights, userId])
}
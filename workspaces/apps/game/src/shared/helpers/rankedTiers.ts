export type RankedTier = "BRONZE" | "ARGENT" | "OR" | "DIAMANT" | "MAITRE"

const TIER_THRESHOLDS: { tier: RankedTier, minElo: number }[] = [
    { tier: "MAITRE",  minElo: 2000 },
    { tier: "DIAMANT", minElo: 1600 },
    { tier: "OR",      minElo: 1300 },
    { tier: "ARGENT",  minElo: 1000 },
    { tier: "BRONZE",  minElo: 0 }
]

export const resolveTier = (elo: number): RankedTier => TIER_THRESHOLDS.find(t => elo >= t.minElo)!.tier

export const getTierMinElo = (tier: RankedTier): number => TIER_THRESHOLDS.find(t => t.tier === tier)!.minElo

export const resolveNextTier = (elo: number): RankedTier | null => {
    const current = resolveTier(elo)
    const currentIndex = TIER_THRESHOLDS.findIndex(t => t.tier === current)
    return currentIndex > 0 ? TIER_THRESHOLDS[currentIndex - 1]!.tier : null
}

export const resolveEloProgress = (currentElo: number) => {
    const currentTier = resolveTier(currentElo)
    const nextTier = resolveNextTier(currentElo)

    const tierMinElo = getTierMinElo(currentTier)
    const nextTierMinElo = nextTier ? getTierMinElo(nextTier) : currentElo

    const progress = nextTier
        ? Math.min(100, ((currentElo - tierMinElo) / (nextTierMinElo - tierMinElo)) * 100)
        : 100

    return { currentTier, nextTier, nextTierMinElo, progress }
}
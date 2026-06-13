const K_FACTOR = 32

export const computeEloChange = (
    playerElo: number,
    opponentElo: number,
    score: 0 | 1
): number => {
    const expectedScore =
        1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))

    return Math.round(
        K_FACTOR * (score - expectedScore)
    )
}
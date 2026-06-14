export const useWinrate = (wins: number, totalGames: number): number => {
    return Math.round((wins / totalGames) * 100)
}
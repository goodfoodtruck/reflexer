import PlayerWinrate from "./winrate/PlayerWinrate"
interface PlayerStatsProps {
    wins: number
    losses: number
    totalGames: number
    currentWinstreak: number
    highestWinstreak: number
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ 
    wins, 
    losses, 
    totalGames, 
    currentWinstreak, 
    highestWinstreak 
}) => {
    return (
        <div className="flex flex-col rounded-md w-full">
            <PlayerWinrate 
                wins={wins}
                losses={losses}
                totalGames={totalGames}
                currentWinstreak={currentWinstreak}
                highestWinstreak={highestWinstreak}
            />
        </div>
    )
}

export default PlayerStats
import PlayerTotalGames from "@pages/arena/sections/player-stats/PlayerTotalGames"
import PlayerWinrate from "@pages/arena/sections/player-stats/PlayerWinrate"
import PlayerWinstreak from "@pages/arena/sections/player-stats/PlayerWinstreak"

interface PlayerStatsSectionProps {}

const PlayerStatsSection: React.FC<PlayerStatsSectionProps> = () => {
    return (
        <div className="flex flex-col border rounded-md p-2 bg-blue w-full h-200">
            <PlayerTotalGames/>
            <PlayerWinrate/>
            <PlayerWinstreak/>
        </div>
    )
}

export default PlayerStatsSection
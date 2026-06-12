import type { BasePvpFight } from "@shared/fight.types"
import PlayerWinrate from "./winrate/PlayerWinrate"
interface PlayerStatsProps {
    playerId: string
    playerFights: BasePvpFight[]
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ playerFights, playerId }) => {
    return (
        <div className="flex flex-col rounded-md w-full">
            <PlayerWinrate playerFights={playerFights} playerId={playerId}/>
        </div>
    )
}

export default PlayerStats
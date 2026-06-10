import type { BasePvpFight } from "@shared/fight.types"
import PlayerWinrate from "./winrate/PlayerWinrate"
interface PlayerStatsSectionProps {
    playerId: string
    playerFights: BasePvpFight[]
}

const PlayerStatsSection: React.FC<PlayerStatsSectionProps> = ({ playerFights, playerId }) => {
    return (
        <div className="flex flex-col rounded-md w-full">
            <PlayerWinrate playerFights={playerFights} playerId={playerId}/>
        </div>
    )
}

export default PlayerStatsSection
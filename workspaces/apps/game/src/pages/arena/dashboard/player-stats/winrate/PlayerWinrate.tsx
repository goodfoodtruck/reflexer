import { usePlayerWinrate } from "@pages/arena/hooks/usePlayerWinrate"
import type { BasePvpFight } from "@shared/fight.types"
import WinrateBar from "./WinrateBar"
import PlayerCurrentWinstreak from "./PlayerWinstreak"
import NoFightRegisteredAlert from "./NoFightRegisteredAlert"

interface PlayerWinrateProps {
    playerId: string
    playerFights: BasePvpFight[]
}

const PlayerWinrate: React.FC<PlayerWinrateProps> = ({ playerFights, playerId }) => {
    const { total, wins, losses, winrate } = usePlayerWinrate(playerFights, playerId)

    if (total === 0) return <NoFightRegisteredAlert/>
    
    return (
        <div className="panel flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <p className="text-lg text-slate-500 font-bold">
                    {total} combat{total > 1 ? "s" : ""}
                </p>
            </div>

            <div className="flex items-end gap-6">
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-white tracking-tight">
                        {winrate}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                        Winrate
                    </span>
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <WinrateBar wins={wins} losses={losses} total={total} />

                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-emerald-400">{wins} Victoire(s)</span>
                        <span className="text-rose-400">{losses} Défaite(s)</span>
                    </div>
                </div>
            </div>

            <PlayerCurrentWinstreak playerFights={playerFights} playerId={playerId} />
        </div>
    )
}

export default PlayerWinrate
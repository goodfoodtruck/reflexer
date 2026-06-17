import { useWinrate } from "@pages/arena/hooks/usePlayerWinrate"
import WinrateBar from "./WinrateBar"
import PlayerCurrentWinstreak from "./PlayerWinstreak"
import NoFightRegisteredAlert from "./NoFightRegisteredAlert"
interface PlayerWinrateProps {
    wins: number
    losses: number
    totalGames: number
    currentWinstreak: number
    highestWinstreak: number
}

const PlayerWinrate: React.FC<PlayerWinrateProps> = ({ 
    wins, 
    losses, 
    totalGames, 
    currentWinstreak, 
    highestWinstreak 
}) => {    
    
    const winrate = useWinrate(wins, totalGames)

    if (totalGames === 0) return <NoFightRegisteredAlert/>
    
    return (
        <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <p className="text-lg text-slate-500 font-bold">
                    {totalGames} combat{totalGames > 1 ? "s" : ""}
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
                    <WinrateBar wins={wins} losses={losses} total={totalGames} />

                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-emerald-400">{wins} Victoire(s)</span>
                        <span className="text-rose-400">{losses} Défaite(s)</span>
                    </div>
                </div>
            </div>

            <PlayerCurrentWinstreak 
                currentWinstreak={currentWinstreak}
                highestWinstreak={highestWinstreak}
            />
        </div>
    )
}

export default PlayerWinrate
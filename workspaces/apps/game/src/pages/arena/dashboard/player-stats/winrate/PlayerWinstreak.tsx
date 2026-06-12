import { useCurrentWinstreak } from "@pages/arena/hooks/useCurrentWinstreak"
import type { BasePvpFight } from "@shared/fight.types"

interface PlayerCurrentWinstreakProps {
    playerFights: BasePvpFight[]
    playerId: string
}

const PlayerCurrentWinstreak: React.FC<PlayerCurrentWinstreakProps> = ({ playerFights, playerId }) => {
    const streak = useCurrentWinstreak(playerFights, playerId)

    if (streak < 2) return null

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
            <span className="text-sm">🔥</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Série de {streak} victoire{streak > 1 ? "s" : ""}
            </span>
        </div>
    )
}

export default PlayerCurrentWinstreak
import { useNavigate } from "react-router-dom"
import type { FriendlyFight, BasePvpFight } from "@shared/types/fight.types"
import { useFightOpponentNames } from "@pages/arena/hooks/useFightOpponentNames"
import type { AuthUser } from "@hooks/useAuth"
import FightHistoryList from "@pages/arena/dashboard/fight-history/FightHistoryList"
import FriendlyFightRow from "@pages/arena/dashboard/sections/friendly/history/FriendlyFightRow"


interface FriendlyFightsHistoryProps {
    user: AuthUser
    fights: FriendlyFight[]
}

const FriendlyFightsHistory: React.FC<FriendlyFightsHistoryProps> = ({ user, fights }) => {
    const navigate = useNavigate()
    const opponentNames = useFightOpponentNames(fights, user.id)

    const getOpponentName = (fight: BasePvpFight): string => {
        const opponentId = fight.playerUserId === user.id ? fight.opponentUserId : fight.playerUserId
        return opponentNames.get(opponentId) ?? "..."
    }

    const onFightClick = (playedFight: BasePvpFight) => {
        navigate("/fight", { 
            state: {
                playerName: user.name,
                opponentName: getOpponentName(playedFight),
                fight: { ...playedFight }  
            } 
        })
    }

    return (
        <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-black tracking-[0.3em] uppercase text-amber-500">
                    Historique
                </h2>
                <span className="text-xs text-slate-500 font-bold">
                    {fights.length} combat{fights.length > 1 ? "s" : ""}
                </span>
            </div>

            <FightHistoryList
                fights={fights}
                renderRow={(fight, index) => (
                    <FriendlyFightRow
                        key={fight._id}
                        fight={fight}
                        userId={user.id}
                        opponentName={getOpponentName(fight)}
                        index={index}
                        onReplay={() => onFightClick(fight)}
                    />
                )}
            />
        </div>
    )
}

export default FriendlyFightsHistory
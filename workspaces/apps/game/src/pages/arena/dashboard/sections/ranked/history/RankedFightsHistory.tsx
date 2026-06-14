import { useNavigate } from "react-router-dom"
import type { RankedFight, BasePvpFight } from "../../../../../../shared/types/fight.types"
import { useFightOpponentNames } from "@pages/arena/hooks/useFightOpponentNames"
import type { AuthUser } from "@hooks/useAuth"
import FightHistoryList from "@pages/arena/dashboard/fight-history/FightHistoryList"
import RankedFightRow from "@pages/arena/dashboard/sections/ranked/history/RankedFightRow"

interface RankedFightsHistoryProps {
    user: AuthUser
    fights: RankedFight[]
}

const RankedFightsHistory: React.FC<RankedFightsHistoryProps> = ({ user, fights }) => {
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
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 flex flex-col gap-6">
            <h2 className="text-[14px] font-black tracking-[0.3em] uppercase text-amber-500">
                Historique
            </h2>

            <FightHistoryList
                fights={fights}
                renderRow={(fight, index) => (
                    <RankedFightRow
                        key={fight._id}
                        fight={fight}
                        playerId={user.id}
                        opponentName={getOpponentName(fight)}
                        index={index}
                        onReplay={() => onFightClick(fight)}
                    />
                )}
            />
        </div>
    )
}

export default RankedFightsHistory
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import type { FriendlyFight, BasePvpFight } from "@shared/fight.types"
import { useFightOpponentNames } from "@pages/arena/hooks/useFightOpponentNames"
import type { AuthUser } from "@hooks/useAuth"
import EmptyHistory from "@pages/arena/dashboard/fight-history/EmptyHistory"
import FightHistoryRow from "@pages/arena/dashboard/fight-history/FightHistoryRow"


interface FriendlyFightsHistoryProps {
    user: AuthUser
    fights: FriendlyFight[]
}

const MAX_VISIBLE = 5

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
        <div className="panel flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[14px] section-title text-amber-500">
                    Historique
                </h2>
                <span className="text-xs text-slate-500 font-bold">
                    {fights.length} combat{fights.length > 1 ? "s" : ""}
                </span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                >
                    {fights.length === 0 ? (
                        <EmptyHistory />
                    ) : (
                        <div className={`flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1 ${
                            fights.length > MAX_VISIBLE ? "max-h-75" : ""
                        }`}>
                            {fights.map((fight, index) => (
                                <FightHistoryRow
                                    key={fight._id}
                                    fight={fight}
                                    playerId={user.id}
                                    opponentName={getOpponentName(fight)}
                                    index={index}
                                    onClick={() => onFightClick(fight)}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default FriendlyFightsHistory
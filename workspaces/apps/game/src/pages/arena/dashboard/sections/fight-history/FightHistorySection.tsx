import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import type { FriendlyFight, RankedFight, BasePvpFight } from "@shared/fight.types"
import TabSelector from "./TabSelector"
import FightHistoryRow from "./FightHistoryRow"
import EmptyHistory from "./EmptyHistory"
import { useFightOpponentNames } from "@pages/arena/hooks/useFightOpponentNames"
import type { AuthUser } from "@hooks/useAuth"

type Tab = "FRIENDLY" | "RANKED"

interface FightHistorySectionProps {
    player: AuthUser
    friendlyFights: FriendlyFight[]
    rankedFights: RankedFight[]
}

const MAX_VISIBLE = 5

const FightHistorySection: React.FC<FightHistorySectionProps> = ({ player, friendlyFights, rankedFights }) => {
    const [activeTab, setActiveTab] = useState<Tab>("FRIENDLY")
    const navigate = useNavigate()

    const fights: BasePvpFight[] = activeTab === "FRIENDLY" ? friendlyFights : rankedFights
    const allFights = useMemo(() => [...friendlyFights, ...rankedFights], [friendlyFights, rankedFights])
    const opponentNames = useFightOpponentNames(allFights, player.id)

    const getOpponentName = (fight: BasePvpFight): string => {
        const opponentId = fight.playerUserId === player.id ? fight.opponentUserId : fight.playerUserId
        return opponentNames.get(opponentId) ?? "..."
    }

    const onFightClick = (playedFight: BasePvpFight) => {
        navigate("/fight", { 
            state: {
                playerName: player.name,
                opponentName: getOpponentName(playedFight),
                fight: { ...playedFight }  
            } 
        })
    }

    return (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-500">
                    Historique
                </h2>
                <span className="text-xs text-slate-500 font-bold">
                    {fights.length} combat{fights.length > 1 ? "s" : ""}
                </span>
            </div>

            <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                >
                    {fights.length === 0 ? (
                        <EmptyHistory mode={activeTab} />
                    ) : (
                        <div className={`flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1 ${
                            fights.length > MAX_VISIBLE ? "max-h-75" : ""
                        }`}>
                            {fights.map((fight, index) => (
                                <FightHistoryRow
                                    key={fight._id}
                                    fight={fight}
                                    playerId={player.id}
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

export default FightHistorySection
import { motion } from "framer-motion"
import type { BasePvpFight } from "@shared/fight.types"
import ReplayFightButton from "./ReplayFightButton"
import FightResultBadge from "./FightResultBadge"

interface FightHistoryRowProps {
    fight: BasePvpFight
    playerId: string
    opponentName: string
    index: number
    onClick: () => void
}

const FightHistoryRow: React.FC<FightHistoryRowProps> = ({ fight, playerId, opponentName, index, onClick }) => {    
    const won = fight.winnerId === playerId
    const timeAgo = formatTimeAgo(new Date(fight.createdAt))

    return (
        <motion.div
            className="flex items-center justify-between px-4 py-3 bg-slate-900/40 border border-slate-700/40 rounded-xl hover:border-slate-600 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <div className="flex items-center gap-3">
                <span className="text-sm">{won ? "⚔️" : "💀"}</span>
                <div className="flex flex-col">
                    <span className="text-sm font-black tracking-widest uppercase text-white">
                        {opponentName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                        {timeAgo}
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                <ReplayFightButton onClick={onClick} />
                <FightResultBadge won={won} />
            </div>
        </motion.div>
    )
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return "À l'instant"
    if (diffMin < 60) return `Il y a ${diffMin}min`

    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `Il y a ${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Il y a ${diffDays}j`

    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export default FightHistoryRow
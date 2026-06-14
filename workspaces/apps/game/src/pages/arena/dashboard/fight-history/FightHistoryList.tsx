import { AnimatePresence, motion } from "framer-motion"
import EmptyHistory from "./EmptyHistory"
import type { BasePvpFight } from "../../../../shared/types/fight.types"

interface FightHistoryListProps<T> {
    fights: T[]
    renderRow: (fight: T, index: number) => React.ReactNode
}

const MAX_VISIBLE = 5

function FightHistoryList<T extends BasePvpFight>({ fights, renderRow }: FightHistoryListProps<T>) {
    return (
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
                        {fights.map((fight, index) => renderRow(fight, index))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

export default FightHistoryList
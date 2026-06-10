import type { PlayerSearchResult } from "@services/user.service"
import PlayerResultRow from "./PlayerResultRow"
import { AnimatePresence, motion } from "framer-motion"

interface PlayerSearchResultsProps {
    results: PlayerSearchResult[]
    onChallenge: (player: PlayerSearchResult) => void
}

const MAX_VISIBLE = 5

const PlayerSearchResults: React.FC<PlayerSearchResultsProps> = ({ results, onChallenge }) => {
    return (
        <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">
                    {results.length} joueur{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
                </p>
            </div>

            <div className={`flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1 ${
                results.length > MAX_VISIBLE ? "max-h-70" : ""
            }`}>
                <AnimatePresence mode="popLayout">
                    {results.map((player, index) => (
                        <motion.div
                            key={player._id}
                            layout
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            transition={{ duration: 0.2, delay: index * 0.04 }}
                        >
                            <PlayerResultRow
                                player={player}
                                onChallenge={() => onChallenge(player)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default PlayerSearchResults
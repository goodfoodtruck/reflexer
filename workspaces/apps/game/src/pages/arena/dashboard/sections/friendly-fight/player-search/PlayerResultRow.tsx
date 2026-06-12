import type { PlayerSearchResult } from "@services/user.service"
import ChallengeButton from "./ChallengeButton"
import { motion } from "framer-motion"

interface PlayerResultRowProps {
    player: PlayerSearchResult
    onChallenge: () => void
}

const PlayerResultRow: React.FC<PlayerResultRowProps> = ({ player, onChallenge }) => (
    <motion.div
        className="flex items-center justify-between px-5 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl transition-colors hover:border-slate-600"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
    >
        <span className="text-sm font-black tracking-widest uppercase text-white truncate mr-4">
            {player.name}
        </span>
        <ChallengeButton onClick={onChallenge} />
    </motion.div>
)

export default PlayerResultRow
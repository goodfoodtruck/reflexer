import { motion } from "framer-motion"

interface ReplayFightButtonProps {
    onClick: () => void
}

const ReplayFightButton: React.FC<ReplayFightButtonProps> = ({ onClick }) => {
    return (
        <motion.button
            className="px-3 py-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:border-amber-500 hover:bg-amber-500/20 hover:text-amber-300 text-[10px] font-black tracking-widest uppercase cursor-pointer transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
        >
            ▶ Replay
        </motion.button>
    )
}

export default ReplayFightButton
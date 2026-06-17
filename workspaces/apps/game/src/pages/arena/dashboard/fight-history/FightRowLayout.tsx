import { motion } from "framer-motion"

interface FightRowLayoutProps {
    index: number
    children: React.ReactNode
}

const FightRowLayout: React.FC<FightRowLayoutProps> = ({ index, children }) => (
    <motion.div
        className="flex items-center justify-between px-4 py-3 bg-slate-900/40 border border-slate-700/80 rounded-xl hover:border-slate-600 transition-colors cursor-pointer"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.04 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
    >
        {children}
    </motion.div>
)

export default FightRowLayout
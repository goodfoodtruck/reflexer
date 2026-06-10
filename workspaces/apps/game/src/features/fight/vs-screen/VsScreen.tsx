import { useEffect } from "react"
import { motion } from "framer-motion"

interface VsScreenProps {
    playerName: string
    opponentName: string
    onComplete: () => void
}

const VS_DISPLAY_DURATION = 1800

const VsScreen: React.FC<VsScreenProps> = ({ playerName, opponentName, onComplete }) => {

    useEffect(() => {
        const timer = setTimeout(onComplete, VS_DISPLAY_DURATION)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">

            {/* Ligne de séparation diagonale animée */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-linear-to-b from-transparent via-amber-500 to-transparent -translate-x-1/2" />
            </motion.div>

            {/* Joueur — slide depuis la gauche */}
            <motion.div
                className="flex-1 flex flex-col items-center justify-center gap-3"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
            >
                <motion.span
                    className="text-4xl"
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3, bounce: 0.4 }}
                >
                    ⚔️
                </motion.span>
                <p className="text-lg font-black tracking-widest uppercase text-white">
                    {playerName}
                </p>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-emerald-400">
                    Joueur
                </p>
            </motion.div>

            {/* VS central */}
            <motion.div
                className="absolute z-10"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.4, duration: 0.5, bounce: 0.4 }}
            >
                <motion.p
                    className="text-5xl font-black text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, delay: 0.9, repeat: Infinity, repeatDelay: 0.5 }}
                >
                    VS
                </motion.p>
            </motion.div>

            {/* Adversaire — slide depuis la droite */}
            <motion.div
                className="flex-1 flex flex-col items-center justify-center gap-3"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.2 }}
            >
                <motion.span
                    className="text-4xl"
                    initial={{ scale: 0, rotate: 15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3, bounce: 0.4 }}
                >
                    💀
                </motion.span>
                <p className="text-lg font-black tracking-widest uppercase text-white">
                    {opponentName}
                </p>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-rose-400">
                    Adversaire
                </p>
            </motion.div>

            {/* Flash ambiant */}
            <motion.div
                className="absolute inset-0 bg-amber-500 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                transition={{ duration: 0.3, delay: 0.4 }}
            />
        </div>
    )
}

export default VsScreen
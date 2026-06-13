import { useEffect } from "react"
import { motion } from "framer-motion"
import { FighterCard } from "./FighterCard"

interface VsScreenProps {
    playerName: string
    opponentName: string
    onComplete: () => void
}

const VS_DISPLAY_DURATION = 1800

const VsScreen: React.FC<VsScreenProps> = ({
    playerName,
    opponentName,
    onComplete
}) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, VS_DISPLAY_DURATION)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-linear-to-b from-transparent via-amber-500 to-transparent -translate-x-1/2" />
            </motion.div>

            <FighterCard
                name={playerName}
                role="JOUEUR"
                side="left"
                roleColorClass="text-emerald-400"
            />

            <motion.div
                className="absolute z-10"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: "spring",
                    delay: 0.4,
                    duration: 0.5,
                    bounce: 0.4
                }}
            >
                <motion.p
                    className="
                        text-7xl
                        font-black
                        text-amber-500
                        drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]
                    "
                    animate={{
                        scale: [1, 1.12, 1]
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 0.9,
                        repeat: Infinity,
                        repeatDelay: 0.5
                    }}
                >
                    VS
                </motion.p>
            </motion.div>

            <FighterCard
                name={opponentName}
                role="ADVERSAIRE"
                side="right"
                roleColorClass="text-rose-400"
            />

            <motion.div
                className="absolute inset-0 bg-amber-500 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                transition={{
                    duration: 0.3,
                    delay: 0.4
                }}
            />
        </div>
    )
}

export default VsScreen
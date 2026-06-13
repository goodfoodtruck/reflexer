import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import VsScreen from "./VsScreen"

type TransitionPhase = "WIPE_IN" | "VS_SCREEN" | "WIPE_OUT" | "DONE"

interface CombatTransitionProps {
    playerName: string
    opponentName: string
    onComplete: () => void
}

const CombatTransition: React.FC<CombatTransitionProps> = ({ playerName, opponentName, onComplete }) => {
    const [phase, setPhase] = useState<TransitionPhase>("WIPE_IN")

    useEffect(() => {
        if (phase === "DONE") onComplete()
    }, [phase, onComplete])

    return (
        <div className="fixed inset-0 z-100 pointer-events-none">
            {phase === "WIPE_IN" && (
                <div className="absolute inset-0 flex overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 bg-slate-950 origin-top"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                                duration: 0.3,
                                delay: i * 0.06,
                                ease: "easeInOut"
                            }}
                            onAnimationComplete={() => {
                                if (i === 4) setPhase("VS_SCREEN")
                            }}
                        />
                    ))}
                </div>
            )}

            {phase === "VS_SCREEN" && (
                <VsScreen
                    playerName={playerName}
                    opponentName={opponentName}
                    onComplete={() => setPhase("WIPE_OUT")}
                />
            )}

            {phase === "WIPE_OUT" && (
                <div className="absolute inset-0 flex overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 bg-slate-950 origin-bottom"
                            initial={{ scaleY: 1 }}
                            animate={{ scaleY: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: i * 0.06,
                                ease: "easeInOut"
                            }}
                            onAnimationComplete={() => {
                                if (i === 4) setPhase("DONE")
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CombatTransition
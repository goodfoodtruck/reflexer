import { useState } from "react"
import { useAuth } from "@hooks/useAuth"
import { FriendlyFightService } from "@services/fight/friendlyFight.service"
import type { PlayerSearchResult } from "@services/user.service"
import { ChallengeErrorView } from "./views/ChallengeErrorView"
import { ChallengeLoadingView } from "./views/ChallengeLoadingView"
import { ChallengeConfirmView } from "./views/ChallengeConfirmView"
import { AnimatePresence, motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

type ModalState =
    | { step: "CONFIRM" }
    | { step: "LOADING" }
    | { step: "ERROR";  message: string }

interface ChallengeModalProps {
    opponent: PlayerSearchResult
    onClose: () => void
}


const ChallengeModal: React.FC<ChallengeModalProps> = ({ opponent, onClose }) => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [state, setState] = useState<ModalState>({ step: "CONFIRM" })

    if (! user) return null // TODO: rediriger vers login ?

    const onChallenge = async () => {        
        try {
            const playedFight = await FriendlyFightService.playFight({
                playerId: user!.id,
                opponentId: opponent._id,
                fightMapId: "TRAINING_GROUND"
            })

            onClose()
            
            navigate("/fight", { 
                state: {
                    playerName: playedFight.playerUser.name,
                    opponentName: playedFight.opponentUser.name,
                    fight: { ...playedFight }
                } 
            })
        } catch (err) {
            setState({ step: "ERROR", message: err instanceof Error ? err.message : "Erreur" })
        }
    }

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
                className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col gap-6 overflow-hidden"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                onClick={e => e.stopPropagation()}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state.step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {state.step === "CONFIRM" && (
                            <ChallengeConfirmView
                                opponentName={opponent.name}
                                onChallenge={onChallenge}
                                onClose={onClose}
                            />
                        )}

                        {state.step === "LOADING" && <ChallengeLoadingView />}

                        {state.step === "ERROR" && (
                            <ChallengeErrorView
                                message={state.message}
                                onRetry={() => setState({ step: "CONFIRM" })}
                                onClose={onClose}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}

export default ChallengeModal
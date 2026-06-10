import { useState } from "react"
import { useAuth } from "@hooks/useAuth"
import { FriendlyFightService } from "@services/fight/friendlyFight.service"
import type { PlayerSearchResult } from "@services/user.service"
import { useNavigate } from "react-router-dom"
import { ChallengeErrorView } from "./views/ChallengeErrorView"
import { ChallengeResultView } from "./views/ChallengeResultView"
import { ChallengeLoadingView } from "./views/ChallengeLoadingView"
import { ChallengeConfirmView } from "./views/ChallengeConfirmView"

type ModalState =
    | { step: "CONFIRM" }
    | { step: "LOADING" }
    | { step: "RESULT"; won: boolean }
    | { step: "ERROR";  message: string }

interface ChallengeModalProps {
    opponent: PlayerSearchResult
    onClose: () => void
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ opponent, onClose }) => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [state, setState] = useState<ModalState>({ step: "CONFIRM" })

    const onChallenge = async () => {
        if (! user) return

        setState({ step: "LOADING" })

        try {
            const result = await FriendlyFightService.playFight({
                playerId: user.id,
                opponentId: opponent._id,
                fightMapId: "TRAINING_GROUND"
            })

            navigate("/fight", { state: { fightResult: result } })
        } catch (err) {
            setState({
                step: "ERROR",
                message: err instanceof Error ? err.message : "Erreur"
            })
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div
                className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col gap-6"
                onClick={e => e.stopPropagation()}
            >
                {state.step === "CONFIRM" && (
                    <ChallengeConfirmView
                        opponentName={opponent.name}
                        onChallenge={onChallenge}
                        onClose={onClose}
                    />
                )}

                {state.step === "LOADING" && <ChallengeLoadingView />}

                {state.step === "RESULT" && (
                    <ChallengeResultView
                        won={state.won}
                        opponentName={opponent.name}
                        onClose={onClose}
                    />
                )}

                {state.step === "ERROR" && (
                    <ChallengeErrorView
                        message={state.message}
                        onRetry={() => setState({ step: "CONFIRM" })}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    )
}


export default ChallengeModal
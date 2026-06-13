import { useState } from "react"
import { type AuthUser } from "@hooks/useAuth"
import { RankedFightService, type PlayRankedFightResponse } from "@services/fight/rankedFight.service"
import { motion } from 'framer-motion'
import Leaderboard from "./learderboard/Leaderboard"
import { useNavigate } from "react-router-dom"
import ErrorAlert from "@components/shared/ErrorAlert"
import type { RankedFight } from "@shared/fight.types"
import PlayerStats from "@pages/arena/dashboard/player-stats/PlayerStats"
import RankedFightsHistory from "./history/RankedFightsHistory"

interface RankedSectionProps {
    userRankedFightsHistory: RankedFight[]
    user: AuthUser
}

const RankedSection: React.FC<RankedSectionProps> = ({ userRankedFightsHistory, user }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onFightReady = (fight: PlayRankedFightResponse) => {
        navigate("/fight", { 
            state: {
                playerName: fight.player.user.name,
                opponentName: fight.opponent.user.name,
                fight: { ...fight }
            }
        })
    }

    const onFindMatch = async () => {
        if (! user) return
        setError(null)
        setLoading(true)

        try {
            const result = await RankedFightService.findAndPlayMatch(user.id)
            setTimeout(() => {}, 2000)
            onFightReady(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible de trouver un adversaire")
        } finally {
            setLoading(false)
        }
    }

    if (! user) return null // TODO: redirection login ?

    return (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col justify-between gap-6">
                <h2 className="text-[15px] font-black tracking-[0.3em] uppercase text-white-500">
                    Parties classées
                </h2>
                <div className="w-full h-px bg-slate-700"></div>
            </div>

            <motion.button
                onClick={onFindMatch}
                disabled={loading}
                className="w-max p-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <motion.span
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        Recherche d'un adversaire...
                    </span>
                ) : (
                    "Nouvelle partie classée"
                )}
            </motion.button>

            { error && <ErrorAlert error={error}/> }

            <PlayerStats playerFights={userRankedFightsHistory} playerId={user.id}/>

            <RankedFightsHistory user={user} fights={userRankedFightsHistory} />

            <Leaderboard />
        </div>
    )
}

export default RankedSection
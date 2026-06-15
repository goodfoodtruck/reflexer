import { useState } from "react"
import { type AuthUser } from "@hooks/useAuth"
import { RankedFightService, type PlayRankedFightResponse } from "@services/fight/rankedFight.service"
import Leaderboard from "./learderboard/Leaderboard"
import { useNavigate } from "react-router-dom"
import ErrorAlert from "@components/shared/ErrorAlert"
import type { RankedFight } from "@shared/types/fight.types"
import PlayerStats from "@pages/arena/dashboard/player-stats/PlayerStats"
import RankedFightsHistory from "./history/RankedFightsHistory"
import type { UserRankingResponse } from "@services/userRanking.service"
import NewGameButton from "./new-game/NewGameButton"
import UserRankedProfile from "./user-profile/UserRankedProfile"

interface RankedSectionProps {
    userRankedFightsHistory: RankedFight[]
    userRanking: UserRankingResponse
    user: AuthUser
}

const RankedSection: React.FC<RankedSectionProps> = ({ userRankedFightsHistory, userRanking, user }) => {
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

    const findMatch = async () => {
        if (! user) return
        setError(null)
        setLoading(true)

        try {
            const result = await RankedFightService.findAndPlayMatch(user.id)            
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

            <UserRankedProfile user={user} userRanking={userRanking.ranking}/>

            <NewGameButton 
                findMatch={findMatch} 
                matchFound={loading} 
            />

            { error && <ErrorAlert error={error}/> }

            <PlayerStats 
                wins={userRanking.ranking.wins}
                losses={userRanking.ranking.losses}
                totalGames={userRanking.ranking.totalGames}
                currentWinstreak={userRanking.ranking.currentWinstreak}
                highestWinstreak={userRanking.ranking.highestWinstreak}
            />

            <RankedFightsHistory user={user} fights={userRankedFightsHistory} />

            <Leaderboard />
        </div>
    )
}

export default RankedSection
import { useState } from "react"
import { AnimatePresence } from "framer-motion"
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
import { withMinimumDuration } from "@shared/helpers/timing"
import MatchmakingOverlay from "./new-game/MatchMakingOverlay"

const MATCHMAKING_MIN_DURATION_MS = 4000

type MatchmakingState =
    | { status: "idle" }
    | { status: "searching" }
    | { status: "failed"; reason: string }

interface RankedSectionProps {
    userRankedFightsHistory: RankedFight[]
    userRanking: UserRankingResponse
    user: AuthUser
}

const RankedSection: React.FC<RankedSectionProps> = ({ userRankedFightsHistory, userRanking, user }) => {
    const navigate = useNavigate()
    const [matchmaking, setMatchmaking] = useState<MatchmakingState>({ status: "idle" })

    const onFightReady = (fight: PlayRankedFightResponse) => {
        navigate("/fight", {
            state: {
                playerName: fight.player.user.name,
                opponentName: fight.opponent.user.name,
                fight: { ...fight },
            },
        })
    }

    const findMatch = async () => {
        if (! user) return
        setMatchmaking({ status: "searching" })

        try {
            const result = await withMinimumDuration(
                RankedFightService.findAndPlayMatch(user.id),
                MATCHMAKING_MIN_DURATION_MS,
            )
            onFightReady(result)
        } catch (err) {
            setMatchmaking({
                status: "failed",
                reason: err instanceof Error ? err.message : "Impossible de trouver un adversaire",
            })
        }
    }

    if (!user) return null // TODO: redirection login ?

    return (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col justify-between gap-6">
                <h2 className="text-[15px] font-black tracking-[0.3em] uppercase text-white-500">
                    Parties classées
                </h2>
                <div className="w-full h-px bg-slate-700"></div>
            </div>

            <UserRankedProfile user={user} userRanking={userRanking.ranking} />

            <NewGameButton findMatch={findMatch} isSearching={matchmaking.status === "searching"} />

            {matchmaking.status === "failed" && <ErrorAlert error={matchmaking.reason} />}

            <PlayerStats
                wins={userRanking.ranking.wins}
                losses={userRanking.ranking.losses}
                totalGames={userRanking.ranking.totalGames}
                currentWinstreak={userRanking.ranking.currentWinstreak}
                highestWinstreak={userRanking.ranking.highestWinstreak}
            />

            <RankedFightsHistory user={user} fights={userRankedFightsHistory} />

            <Leaderboard />

            <AnimatePresence>
                {matchmaking.status === "searching" && <MatchmakingOverlay />}
            </AnimatePresence>
        </div>
    )
}

export default RankedSection
import { useNavigate } from "react-router-dom"
import { AnimatedBackground } from "@components/ui/AnimatedBackground"
import { Header } from "@components/ui/header/Header"
import { useAuth } from "@hooks/useAuth"
import bgHomeImage from "@assets/images/bg-home.png"
import ErrorAlert from "@components/shared/ErrorAlert"
import { useFriendlyFightsHistory } from "./hooks/useFriendlyFightsHistory"
import FriendlyFightsSection from "@pages/arena/dashboard/sections/friendly/FriendlyFightsSection"
import { useRankedFightsHistory } from "@pages/arena/hooks/useRankedFightsHistory"
import RankedSection from "@pages/arena/dashboard/sections/ranked/RankedSection"
import { useUserRanking } from "@pages/arena/hooks/useUserRanking"
import ArenaLoadingOverlay from "./ArenaLoadingOverlay"
import { useTeamReadiness } from "./hooks/UseTeamReadiness"

const ArenaPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    if (! user) return null

    const { userRanking, loading: rankingLoading, error: userRankingError } = useUserRanking(user.id)    
    const { fights: friendlyFights, loading: friendlyLoading, error: friendlyFightsError } = useFriendlyFightsHistory(user.id)
    const { fights: rankedFights, loading: rankedLoading, error: rankedFightsError } = useRankedFightsHistory(user.id)
    const { readiness } = useTeamReadiness()

    const isLoading = rankingLoading || friendlyLoading || rankedLoading
    const error = userRankingError || friendlyFightsError || rankedFightsError

    return (
        <div className="w-full min-h-screen relative overflow-x-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30">
            <AnimatedBackground />

            <div className="absolute inset-0 z-0">
                <img src={bgHomeImage} alt="background" className="w-full h-full object-cover opacity-15" />
            </div>

            <div className="relative z-10 flex flex-col flex-1">
                <Header title="Arène" subtitle="PvP" onBack={() => navigate("/")} />

                <div className="flex flex-col flex-1 p-3 gap-8">
                    {!isLoading && (
                        error ? (
                            <ErrorAlert error={error} />
                        ) : !userRanking ? (
                            <ErrorAlert error="Aucun ranking trouvé pour l'utilisateur." />
                        ) : (
                            <>
                                {readiness && !readiness.ready && (
                                    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm rounded-xl px-4 py-3">
                                        <span className="flex-1">
                                            Configure au moins un gambit pour chacun de tes 2 personnages avant de combattre.
                                        </span>
                                        <button
                                            onClick={() => navigate('/team')}
                                            className="flex-none font-black text-xs uppercase tracking-wide hover:underline whitespace-nowrap"
                                        >
                                            Configurer →
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row flex-1 gap-4">
                                    <div className="w-full lg:basis-[60%] lg:min-w-0">
                                        <RankedSection
                                            user={user}
                                            userRanking={userRanking}
                                            userRankedFightsHistory={rankedFights}
                                        />
                                    </div>
                                    <div className="w-full lg:flex-1 lg:min-w-0">
                                        <FriendlyFightsSection
                                            user={user}
                                            userFriendlyFightsHistory={friendlyFights}
                                        />
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>

            {isLoading && <ArenaLoadingOverlay variant="overlay" label="Chargement de l'arène…" />}
        </div>
    )
}

export default ArenaPage
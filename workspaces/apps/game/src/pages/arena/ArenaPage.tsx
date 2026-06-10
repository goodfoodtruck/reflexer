import { useNavigate } from "react-router-dom"
import { AnimatedBackground } from "@components/ui/AnimatedBackground"
import { Header } from "@components/ui/header/Header"
import { useAuth } from "@hooks/useAuth"
import type { PlayerSearchResult } from "@services/user.service"
import bgHomeImage from "@assets/images/bg-home.png"
import PlayerSearchSection from "@pages/arena/sections/player-search/PlayerSearchSection"
import PlayerStatsSection from "./sections/player-stats/PlayerStatsSection"
import ErrorAlert from "@components/shared/ErrorAlert"
import { useFriendlyFightsHistory } from "./hooks/useFriendlyFightsHistory"

const ArenaPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    if (! user) return null

    const onChallenge = (player: PlayerSearchResult) => {
        navigate(`/arena/${player._id}`, { state: { name: player.name } })
    }

    const { fights, loading, error } = useFriendlyFightsHistory(user.id)

    if (error) return <ErrorAlert error={error}/>

    return (
        <div className="w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30">
            <AnimatedBackground />

            <div className="absolute inset-0 z-0">
                <img src={bgHomeImage} alt="background" className="w-full h-full object-cover opacity-15" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <Header title="Arène" subtitle="PvP" onBack={() => navigate("/")} />

                <PlayerStatsSection playerFights={fights} playerId={user.id}/>

                <div className="flex-1 flex flex-col items-center justify-start pt-16 px-8 gap-12">
                    <PlayerSearchSection
                        currentUserId={user.id}
                        onChallenge={onChallenge}
                    />
                </div>
            </div>
        </div>
    )
}

export default ArenaPage
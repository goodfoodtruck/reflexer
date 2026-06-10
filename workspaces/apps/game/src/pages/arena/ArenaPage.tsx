import { useNavigate } from "react-router-dom"
import { AnimatedBackground } from "@components/ui/AnimatedBackground"
import { Header } from "@components/ui/header/Header"
import { useAuth } from "@hooks/useAuth"
import bgHomeImage from "@assets/images/bg-home.png"
import PlayerStatsSection from "./sections/player-stats/PlayerStatsSection"
import ErrorAlert from "@components/shared/ErrorAlert"
import { useFriendlyFightsHistory } from "./hooks/useFriendlyFightsHistory"
import FriendlyFightsSection from "./sections/friendly-fight/FriendlyFightsSection"

const ArenaPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    if (! user) return null

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
                <div className="flex flex-col p-4 gap-4">
                    <PlayerStatsSection playerFights={fights} playerId={user.id}/>
                    <FriendlyFightsSection userId={user.id}/>
                </div>
            </div>
        </div>
    )
}

export default ArenaPage
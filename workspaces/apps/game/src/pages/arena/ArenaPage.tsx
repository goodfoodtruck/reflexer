import { useNavigate } from "react-router-dom"
import { AnimatedBackground } from "@components/ui/AnimatedBackground"
import { Header } from "@components/ui/header/Header"
import { useAuth } from "@hooks/useAuth"
import bgHomeImage from "@assets/images/bg-home.png"
import PlayerStatsSection from "./dashboard/sections/player-stats/PlayerStatsSection"
import ErrorAlert from "@components/shared/ErrorAlert"
import { useFriendlyFightsHistory } from "./hooks/useFriendlyFightsHistory"
import FriendlyFightsSection from "./dashboard/sections/friendly-fight/FriendlyFightsSection"
import FightHistorySection from "./dashboard/sections/fight-history/FightHistorySection"
import { useRankedFightsHistory } from "./hooks/useRankedFightsHistory"
import RankedSection from "./dashboard/sections/ranked/RankedSection"

const ArenaPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    if (! user) return null

    const { fights: friendlyFights, error: friendlyFightsError } = useFriendlyFightsHistory(user.id)
    const { fights: rankedFights, error: rankedFightsError } = useRankedFightsHistory(user.id)

    if (friendlyFightsError) return <ErrorAlert error={friendlyFightsError}/>
    if (rankedFightsError) return <ErrorAlert error={rankedFightsError}/>

    return (
        <div className="w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30">
            <AnimatedBackground />

            <div className="absolute inset-0 z-0">
                <img src={bgHomeImage} alt="background" className="w-full h-full object-cover opacity-15" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <Header title="Arène" subtitle="PvP" onBack={() => navigate("/")} />
                <div className="flex flex-col p-4 gap-4">

                    { /* Stats du joueur */}
                     <PlayerStatsSection playerFights={friendlyFights} playerId={user.id}/>

                    <RankedSection/>

                    { /* Lancer un défi amical */}
                    <FriendlyFightsSection userId={user.id}/>

                    { /* Historique classé + amical */}
                    <FightHistorySection 
                        player={user} 
                        friendlyFights={friendlyFights}
                        rankedFights={rankedFights}
                    />
                </div>
            </div>
        </div>
    )
}

export default ArenaPage
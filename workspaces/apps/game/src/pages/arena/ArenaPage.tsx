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

const ArenaPage: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    if (! user) return null

    const { userRanking, error: userRankingError } = useUserRanking(user.id)    
    const { fights: friendlyFights, error: friendlyFightsError } = useFriendlyFightsHistory(user.id)
    const { fights: rankedFights, error: rankedFightsError } = useRankedFightsHistory(user.id)

    if (! userRanking) return <ErrorAlert error="Aucun ranking trouvé pour l'utilisateur."/>
    if (userRankingError) return <ErrorAlert error={userRankingError}/>
    if (friendlyFightsError) return <ErrorAlert error={friendlyFightsError}/>
    if (rankedFightsError) return <ErrorAlert error={rankedFightsError}/>

    return (
        <div className="w-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30">
            <AnimatedBackground />

            <div className="absolute inset-0 z-0">
                <img src={bgHomeImage} alt="background" className="w-full h-full object-cover opacity-15" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <Header title="Arène" subtitle="PvP" onBack={() => navigate("/")} />
                <div className="flex flex-col p-4 gap-8">
                    <RankedSection 
                        user={user} 
                        userRanking={userRanking}
                        userRankedFightsHistory={rankedFights}
                    />

                    <FriendlyFightsSection 
                        user={user} 
                        userFriendlyFightsHistory={friendlyFights}
                    />
                </div>
            </div>
        </div>
    )
}

export default ArenaPage
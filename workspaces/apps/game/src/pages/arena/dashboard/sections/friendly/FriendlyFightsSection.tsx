import { useState } from "react"
import type { PlayerSearchResult } from "@services/user.service"
import ChallengeModal from "./challenge/ChallengeModal"
import PlayerSearchSection from "./player-search/PlayerSearchSection"
import type { AuthUser } from "@hooks/useAuth"
import type { FriendlyFight } from "../../../../../shared/types/fight.types"
import FriendlyFightsHistory from "@pages/arena/dashboard/sections/friendly/history/FriendlyFightsHistory"
interface FriendlyFightsSectionProps {
    user: AuthUser
    userFriendlyFightsHistory: FriendlyFight[]
}

const FriendlyFightsSection: React.FC<FriendlyFightsSectionProps> = ({ user, userFriendlyFightsHistory }) => {
    const [challengedPlayer, setChallengedPlayer] = useState<PlayerSearchResult | null>(null)

    return (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col justify-between gap-6">
                <h2 className="text-[15px] font-black tracking-[0.3em] uppercase text-white-500">
                    Parties amicales
                </h2>
                <div className="w-full h-px bg-slate-700"></div>
            </div>

            <PlayerSearchSection
                currentUser={user}
                onChallenge={setChallengedPlayer}
            />

            <FriendlyFightsHistory fights={userFriendlyFightsHistory} user={user}/>

            {challengedPlayer && (
                <ChallengeModal
                    opponent={challengedPlayer}
                    onClose={() => setChallengedPlayer(null)}
                />
            )}
        </div>
    )
}

export default FriendlyFightsSection
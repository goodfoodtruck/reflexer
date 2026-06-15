import { useState } from "react"
import type { PlayerSearchResult } from "@services/user.service"
import ChallengeModal from "./challenge/ChallengeModal"
import PlayerSearchSection from "./player-search/PlayerSearchSection"
import type { AuthUser } from "@hooks/useAuth"
import type { FriendlyFight } from "@shared/fight.types"
import PlayerStats from "@pages/arena/dashboard/player-stats/PlayerStats"
import FriendlyFightsHistory from "./history/FriendlyFightsHistory"

interface FriendlyFightsSectionProps {
    user: AuthUser
    userFriendlyFightsHistory: FriendlyFight[]
}

const FriendlyFightsSection: React.FC<FriendlyFightsSectionProps> = ({ user, userFriendlyFightsHistory }) => {
    const [challengedPlayer, setChallengedPlayer] = useState<PlayerSearchResult | null>(null)

    return (
        <div className="panel flex flex-col gap-5">
            <div className="flex flex-col justify-between gap-6">
                <h2 className="text-[15px] section-title text-white-500">
                    Parties amicales
                </h2>
                <div className="divider-h"></div>
            </div>

            <PlayerStats playerFights={userFriendlyFightsHistory} playerId={user.id}/>

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
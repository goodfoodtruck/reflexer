import { useState } from "react"
import type { PlayerSearchResult } from "@services/user.service"
import ChallengeModal from "./challenge/ChallengeModal"
import PlayerSearchSection from "./player-search/PlayerSearchSection"

interface FriendlyFightsSectionProps {
    userId: string
}

const FriendlyFightsSection: React.FC<FriendlyFightsSectionProps> = ({ userId }) => {
    const [challengedPlayer, setChallengedPlayer] = useState<PlayerSearchResult | null>(null)

    return (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 flex flex-col gap-5">
            <h2 className="text-bold text-xl">Défi amical</h2>

            <PlayerSearchSection
                currentUserId={userId}
                onChallenge={setChallengedPlayer}
            />

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
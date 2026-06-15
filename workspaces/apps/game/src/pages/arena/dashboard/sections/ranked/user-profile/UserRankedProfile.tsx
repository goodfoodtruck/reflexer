import { motion } from "framer-motion"
import type { AuthUser } from "@hooks/useAuth"
import type { UserRanking } from "@services/userRanking.service"
import EloDisplay from "./EloDisplay"
import RankedTierBadge from "./RankedTierBadge"
import { resolveTier, type RankedTier } from "@shared/helpers/rankedTiers"

interface UserRankedProfileProps {
    user: AuthUser
    userRanking: UserRanking
}

const UserRankedProfile: React.FC<UserRankedProfileProps> = ({ user, userRanking }) => {
    const userRankedTier = resolveTier(userRanking.currentElo)

    return (
        <motion.div
            className="w-full bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 flex flex-col gap-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <PlayerHeader 
                name={user.name} 
                userRankedTier={userRankedTier} 
            />

            <EloDisplay
                currentElo={userRanking.currentElo}
                highestElo={userRanking.highestElo}
            />
        </motion.div>
    )
}

interface PlayerHeaderProps {
    name: string
    userRankedTier: RankedTier
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({ name, userRankedTier }) => (
    <div className="flex items-center gap-3">
        <div className="flex flex-col">
            <span className="text-2xl font-black tracking-widest uppercase text-white">
                {name}
            </span>
        </div>
        <RankedTierBadge tier={userRankedTier}/>
    </div>
)

export default UserRankedProfile
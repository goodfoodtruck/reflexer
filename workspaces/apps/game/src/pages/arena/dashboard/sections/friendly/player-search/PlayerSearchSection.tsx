import type { PlayerSearchResult } from "@services/user.service"
import { usePlayerSearch } from "@pages/arena/hooks/usePlayerSearch"
import PlayerSearchInput from "./PlayerSearchInput"
import PlayerSearchResults from "./PlayerSearchResults"
import ErrorAlert from "@components/shared/ErrorAlert"
import type { AuthUser } from "@hooks/useAuth"
import { AnimatePresence, motion } from "framer-motion"

interface PlayerSearchSectionProps {
    currentUser: AuthUser
    onChallenge: (player: PlayerSearchResult) => void
}

const PlayerSearchSection: React.FC<PlayerSearchSectionProps> = ({ currentUser, onChallenge }) => {
    const { query, setQuery, results, loading, error } = usePlayerSearch(currentUser.id)

    const showResults = results.length > 0
    const showEmpty = results.length === 0 && query.length >= 2 && !loading

    return (
        <div className="w-full flex flex-col gap-4 bg-slate-900/60 border border-slate-700/80 rounded-2xl p-6">
            <PlayerSearchInput query={query} loading={loading} onChange={setQuery} />

            {error && <ErrorAlert error={error} />}

            <AnimatePresence mode="wait">
                {showResults && (
                    <PlayerSearchResults key="results" results={results} onChallenge={onChallenge} />
                )}
                {showEmpty && (
                    <motion.p
                        key="empty"
                        className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        Aucun joueur trouvé
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

export default PlayerSearchSection


import type { PlayerSearchResult } from "@services/user.service"
import { usePlayerSearch } from "@pages/arena/hooks/usePlayerSearch"
import PlayerSearchInput from "./PlayerSearchInput"
import PlayerSearchResults from "./PlayerSearchResults"
import ErrorAlert from "@components/shared/ErrorAlert"
import type { AuthUser } from "@hooks/useAuth"

interface PlayerSearchSectionProps {
    currentUser: AuthUser
    onChallenge: (player: PlayerSearchResult) => void
}

const PlayerSearchSection: React.FC<PlayerSearchSectionProps> = ({ currentUser, onChallenge }) => {
    const { query, setQuery, results, loading, error } = usePlayerSearch(currentUser.id)

    return (
        <div className="w-full flex flex-col gap-4 bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
            <PlayerSearchInput query={query} loading={loading} onChange={setQuery} />

            {error && <ErrorAlert error={error} />}

            {results.length > 0 && <PlayerSearchResults results={results} onChallenge={onChallenge} />}

            {results.length === 0 && query.length >= 2 && !loading && (
                <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest py-8">
                    Aucun joueur trouvé
                </p>
            )}
        </div>
    )
}

export default PlayerSearchSection


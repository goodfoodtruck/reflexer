import type { PlayerSearchResult } from "@services/user.service"
import { usePlayerSearch } from "@pages/arena/hooks/usePlayerSearch"
import PlayerSearchInput from "./PlayerSearchInput"
import PlayerSearchResults from "./PlayerSearchResults"

interface PlayerSearchSectionProps {
    currentUserId: string | undefined
    onChallenge: (player: PlayerSearchResult) => void
}

const PlayerSearchSection: React.FC<PlayerSearchSectionProps> = ({ currentUserId, onChallenge }) => {
    const { query, setQuery, results, loading, error } = usePlayerSearch(currentUserId)

    return (
        <div className="w-full flex flex-col gap-4">
            <PlayerSearchInput query={query} loading={loading} onChange={setQuery} />

            {error && <ErrorBanner errorMessage={error} />}

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

interface ErrorBannerProps {
    errorMessage: string
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ errorMessage }) => {
    return (
        <div className="text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {errorMessage}
        </div>
    )
}

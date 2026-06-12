import type { PlayerSearchResult } from "@services/user.service"
import { usePlayerSearch } from "@pages/arena/hooks/usePlayerSearch"
import PlayerSearchInput from "./PlayerSearchInput"
import PlayerSearchResults from "./PlayerSearchResults"
import ErrorAlert from "@components/shared/ErrorAlert"

interface PlayerSearchSectionProps {
    currentUserId: string | undefined
    onChallenge: (player: PlayerSearchResult) => void
}

const PlayerSearchSection: React.FC<PlayerSearchSectionProps> = ({ currentUserId, onChallenge }) => {
    const { query, setQuery, results, loading, error } = usePlayerSearch(currentUserId)

    return (
        <div className="w-full flex flex-col gap-4">
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


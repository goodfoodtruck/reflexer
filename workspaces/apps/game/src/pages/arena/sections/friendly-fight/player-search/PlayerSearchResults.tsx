import type { PlayerSearchResult } from "@services/user.service"

interface PlayerSearchResultsProps {
    results: PlayerSearchResult[]
    onChallenge: (player: PlayerSearchResult) => void
}

const PlayerSearchResults: React.FC<PlayerSearchResultsProps> = ({ results, onChallenge }) => {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">
                {results.length} joueur{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
            </p>
            {results.map((player) => (
                <div key={player._id} className="flex items-center justify-between px-5 py-4 bg-slate-900/60 border border-slate-700/50 rounded-xl">
                    <span className="text-sm font-black tracking-widest uppercase text-white">
                        {player.name}
                    </span>
                    <button
                        onClick={() => onChallenge(player)}
                        className="px-5 py-2 bg-transparent border border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-black tracking-widest uppercase text-xs rounded-lg transition-all"
                    >
                        Défier
                    </button>
                </div>
            ))}
        </div>
    )
}

export default PlayerSearchResults
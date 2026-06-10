interface PlayerSearchInputProps {
    query: string
    loading: boolean
    onChange: (value: string) => void
    onKeyDown: (e: React.KeyboardEvent) => void
    onSearch: () => void
}

const PlayerSearchInput: React.FC<PlayerSearchInputProps> = ({ query, loading, onChange, onKeyDown, onSearch }) => {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-500">
                Rechercher par pseudo
            </p>
            <div className="flex gap-3">
                <input
                    type="text"
                    className="flex-1 bg-slate-900/80 border border-slate-700/50 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all font-bold placeholder-slate-600 text-sm"
                    placeholder="Nom du joueur..."
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    autoFocus
                />
                <button
                    onClick={onSearch}
                    disabled={loading || query.trim() === ""}
                    className="px-6 py-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                    {loading ? "..." : "Chercher"}
                </button>
            </div>
        </div>
    )
}

export default PlayerSearchInput
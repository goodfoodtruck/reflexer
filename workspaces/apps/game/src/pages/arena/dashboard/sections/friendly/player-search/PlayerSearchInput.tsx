interface PlayerSearchInputProps {
    query: string
    loading: boolean
    onChange: (value: string) => void
}

const PlayerSearchInput: React.FC<PlayerSearchInputProps> = ({ query, loading, onChange }) => {
    return (
        <div className="flex flex-col gap-5">
            <p className="text-[14px] section-title text-amber-500">
                Défier un joueur
            </p>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all font-bold placeholder-slate-600 text-sm"
                    placeholder="Nom du joueur..."
                    value={query}
                    onChange={e => onChange(e.target.value)}
                    autoFocus
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    )
}

export default PlayerSearchInput
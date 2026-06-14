interface PlayerCurrentWinstreakProps {
    currentWinstreak: number, 
    highestWinstreak: number
}

const PlayerCurrentWinstreak: React.FC<PlayerCurrentWinstreakProps> = ({ currentWinstreak, highestWinstreak }) => {
    if (currentWinstreak < 2 && highestWinstreak < 2) return null

    return (
        <div className="flex gap-2">
            {currentWinstreak >= 2 && (
                <StreakBadge
                    icon="🔥"
                    value={currentWinstreak}
                    label="Série en cours"
                    color="emerald"
                />
            )}
            {highestWinstreak >= 2 && (
                <StreakBadge
                    icon="🏆"
                    value={highestWinstreak}
                    label="Meilleure série"
                    color="amber"
                />
            )}
        </div>
    )
}

const COLORS = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber:   "bg-amber-500/10 border-amber-500/20 text-amber-400"
}

interface StreakBadgeProps {
    icon: string
    value: number
    label: string
    color: keyof typeof COLORS
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ icon, value, label, color }) => {
    return (
        <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border ${COLORS[color]}`}>
            <span className="text-sm">{icon}</span>
            <span className="text-sm font-black">{value}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                {label}
            </span>
        </div>
    )
}

export default PlayerCurrentWinstreak
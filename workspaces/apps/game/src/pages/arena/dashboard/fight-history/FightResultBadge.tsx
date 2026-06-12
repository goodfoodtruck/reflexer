interface FightResultBadgeProps {
    won: boolean
}

const FightResultBadge: React.FC<FightResultBadgeProps> = ({ won }) => {
    const resultLabel = won ? "VICTOIRE" : "DÉFAITE"
    const resultColor = 
        won
            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            : "text-rose-400 border-rose-500/30 bg-rose-500/10"

    return (
        <span className={`flex items-center px-3 py-1 rounded-md border text-[10px] font-black tracking-widest uppercase ${resultColor}`}>
                    {resultLabel}
        </span>
    )
}

export default FightResultBadge
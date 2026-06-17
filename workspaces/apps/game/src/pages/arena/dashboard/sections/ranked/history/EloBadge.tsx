interface EloBadgeProps {
    delta: number
}

const EloBadge: React.FC<EloBadgeProps> = ({ delta }) => (
    <span className={`text-xs font-black ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
        {delta >= 0 ? "+" : ""}{delta} elo
    </span>
)

export default EloBadge
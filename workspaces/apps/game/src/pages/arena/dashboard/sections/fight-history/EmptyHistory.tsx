interface EmptyHistoryProps {
    mode: "FRIENDLY" | "RANKED"
}

const EmptyHistory: React.FC<EmptyHistoryProps> = ({ mode }) => (
    <div className="flex flex-col items-center gap-2 py-8">
        <span className="text-2xl">{mode === "FRIENDLY" ? "🤝" : "🏆"}</span>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {mode === "FRIENDLY"
                ? "Aucun match amical joué"
                : "Aucun match classé joué"
            }
        </p>
    </div>
)

export default EmptyHistory
interface ChallengeButtonProps {
    onClick: () => void
}

const ChallengeButton: React.FC<ChallengeButtonProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-transparent border border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-black tracking-widest uppercase text-[10px] rounded-lg transition-all shrink-0"
    >
        Défier
    </button>
)

export default ChallengeButton
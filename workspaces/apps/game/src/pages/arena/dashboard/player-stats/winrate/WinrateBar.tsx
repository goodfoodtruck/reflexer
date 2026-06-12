interface WinrateBarProps {
    wins: number
    losses: number
    total: number
}

const WinrateBar: React.FC<WinrateBarProps> = ({ wins, losses, total }) => {
    const winPercent  = (wins / total) * 100
    const lossPercent = (losses / total) * 100

    return (
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800">
            {winPercent > 0 && (
                <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${winPercent}%` }}
                />
            )}
            {lossPercent > 0 && (
                <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${lossPercent}%` }}
                />
            )}
        </div>
    )
}

export default WinrateBar
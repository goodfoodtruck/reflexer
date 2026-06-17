import { resolveEloProgress } from "@shared/helpers/rankedTiers"
import RankedTierBadge from "./RankedTierBadge"
import type { RankedTier } from "@shared/helpers/rankedTiers"

interface EloDisplayProps {
    currentElo: number
    highestElo: number
}

const EloDisplay: React.FC<EloDisplayProps> = ({ currentElo, highestElo }) => {
    const { currentTier, nextTier, nextTierMinElo, progress } = resolveEloProgress(currentElo)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
                <EloColumn value={currentElo} tier={currentTier} align="left" />

                {nextTier
                    ? <EloColumn value={nextTierMinElo} tier={nextTier} align="right" muted />
                    : <EloColumn value={highestElo} label="Record" align="right" highlight />
                }
            </div>

            <ProgressBar progress={progress} />

            {nextTier && <RecordLabel highestElo={highestElo} />}
        </div>
    )
}

interface EloColumnProps {
    value: number
    tier?: RankedTier
    label?: string
    align: "left" | "right"
    muted?: boolean
    highlight?: boolean
}

const EloColumn: React.FC<EloColumnProps> = ({ value, tier, label, align, muted, highlight }) => {
    const alignClass = align === "right" ? "items-end" : "items-start"
    const valueClass = muted
        ? "text-slate-500"
        : highlight
            ? "text-amber-400"
            : "text-white"

    return (
        <div className={`flex flex-col gap-1.5 ${alignClass}`}>
            <span className={`text-3xl font-black tracking-tight ${valueClass}`}>
                {value}
            </span>
            {tier && <RankedTierBadge tier={tier} />}
            {label && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {label}
                </span>
            )}
        </div>
    )
}

const RecordLabel: React.FC<{ highestElo: number }> = ({ highestElo }) => (
    <div className="flex justify-end items-baseline gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Record
        </span>
        <span className="text-sm font-black text-amber-400">
            {highestElo}
        </span>
    </div>
)

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
            className="h-full bg-linear-to-r from-amber-600 to-amber-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
        />
    </div>
)

export default EloDisplay
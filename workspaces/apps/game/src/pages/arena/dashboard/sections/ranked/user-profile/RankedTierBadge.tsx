import type { RankedTier } from "@shared/helpers/rankedTiers"

interface RankedTierBadgeProps { tier: RankedTier }

const TIER_STYLES: Record<RankedTier, string> = {
    MAITRE:  "bg-amber-500/10 border-amber-500/30 text-amber-300",
    DIAMANT: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    OR:      "bg-yellow-500/10 border-yellow-600/30 text-yellow-400",
    ARGENT:  "bg-slate-400/10 border-slate-400/30 text-slate-300",
    BRONZE:  "bg-orange-700/10 border-orange-700/30 text-orange-400"
}

const TIER_LABELS: Record<RankedTier, string> = {
    MAITRE: "Maître", DIAMANT: "Diamant", OR: "Or", ARGENT: "Argent", BRONZE: "Bronze"
}

const RankedTierBadge: React.FC<RankedTierBadgeProps> = ({ tier }) => (
    <span className={`inline-block px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest uppercase ${TIER_STYLES[tier]}`}>
        {TIER_LABELS[tier]}
    </span>
)

export default RankedTierBadge
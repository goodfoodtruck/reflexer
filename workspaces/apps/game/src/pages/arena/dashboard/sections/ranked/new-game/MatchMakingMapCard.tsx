import { motion, AnimatePresence } from "framer-motion"
import type { FightMapPreview } from "@services/fight/mapFight.service"
import { resolveMapThumbnailUrl } from "@features/fight/rendering/sprite-assets"

interface MatchMakingMapCardProps {
    maps: FightMapPreview[]
    currentIndex: number
}

const SKELETON_MAP: FightMapPreview = { id: "__skeleton__", name: "…", thumbnail: null }

const MatchMakingMapCard: React.FC<MatchMakingMapCardProps> = ({ maps, currentIndex }) => {
    const displayMaps = maps.length > 0 ? maps : [SKELETON_MAP]
    const map = displayMaps[currentIndex % displayMaps.length]!
    const thumbnailUrl = resolveMapThumbnailUrl(map.thumbnail)

    return (
        <div className="relative h-72 w-80" style={{ perspective: "1200px" }} aria-hidden>
            {/* Glowing border */}
            <motion.div
                className="absolute inset-0 rounded-2xl border border-amber-500/40"
                animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.97, 1.03, 0.97] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            />

            <AnimatePresence>
                <motion.div
                    key={map.id}
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80"
                    initial={{ opacity: 0, y: 18, scale: 0.92, rotateX: -18 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -18, scale: 0.92, rotateX: 18 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                    {/* Image zone */}
                    <div className="relative flex-1 overflow-hidden bg-slate-800">
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt={map.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full animate-pulse bg-slate-700/60" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    </div>

                    {/* Name zone */}
                    <div className="flex flex-col items-center justify-center gap-1 px-3 py-3">
                        <span className="text-sm font-bold tracking-wide text-white">{map.name}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default MatchMakingMapCard

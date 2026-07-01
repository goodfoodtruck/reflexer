import { AnimatePresence, motion } from "framer-motion"
import { createPortal } from "react-dom"
import { useEffect, useMemo, useState } from "react"
import type { MatchmakingProfile } from "./MatchMakingProfileCard"
import MatchmakingProfileCard from "./MatchMakingProfileCard"
import MatchMakingMapCard from "./MatchMakingMapCard"
import { MapService, type FightMapPreview } from "@services/fight/mapFight.service"
import type { PlayRankedFightResponse } from "@services/fight/rankedFight.service"
import { resolveMapThumbnailUrl } from "@features/fight/rendering/sprite-assets"

const PLACEHOLDER_NAMES = ["Valtor", "Nyx", "Korrak", "Selene", "Drex", "Maw", "Ophir", "Vesper"]
const ELO_RATIOS = [-0.04, +0.02, -0.015, +0.048, -0.03, +0.035, -0.01, +0.045]
const FLIP_INTERVAL_MS = 380

interface MatchmakingOverlayProps {
    playerElo: number
    profiles?: MatchmakingProfile[]
    foundFight?: PlayRankedFightResponse
}

const MatchmakingOverlay: React.FC<MatchmakingOverlayProps> = ({ playerElo, profiles, foundFight }) => {
    const [maps, setMaps] = useState<FightMapPreview[]>([])
    const [tick, setTick] = useState(0)

    useEffect(() => {
        MapService.getMaps().then(setMaps).catch(() => {})
    }, [])

    useEffect(() => {
        if (foundFight) return
        const id = setInterval(() => setTick(t => t + 1), FLIP_INTERVAL_MS)
        return () => clearInterval(id)
    }, [foundFight])

    const generatedProfiles = useMemo<MatchmakingProfile[]>(
        () => PLACEHOLDER_NAMES.map((name, i) => ({
            id: `p${i}`,
            name,
            rating: Math.round(playerElo * (1 + ELO_RATIOS[i]!)),
        })),
        [playerElo],
    )

    const displayProfiles = profiles ?? generatedProfiles

    const foundMap = foundFight
        ? maps.find(m => m.id === foundFight.initialState.mapId) ?? null
        : null

    const foundOpponentName = foundFight?.opponent.user.name ?? null

    return createPortal(
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-slate-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <AnimatePresence mode="wait">
                {!foundFight ? (
                    <motion.div
                        key="searching"
                        className="flex flex-col items-center gap-10"
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* Two-column layout */}
                        <div className="flex flex-row items-center gap-20">
                            {/* Left — Map search */}
                            <div className="flex flex-col items-center gap-4">
                                <motion.h3
                                    className="text-sm font-black tracking-[0.3em] uppercase text-amber-400"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    Recherche de carte
                                </motion.h3>
                                <MatchMakingMapCard maps={maps} currentIndex={tick} />
                            </div>

                            {/* Vertical divider */}
                            <div className="h-56 w-px bg-slate-700/50" />

                            {/* Right — Opponent search */}
                            <div className="flex flex-col items-center gap-4">
                                <motion.h3
                                    className="text-sm font-black tracking-[0.3em] uppercase text-amber-400"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                                >
                                    Recherche d'un adversaire
                                </motion.h3>
                                <MatchmakingProfileCard profiles={displayProfiles} currentIndex={tick} />
                            </div>
                        </div>

                        {/* Loading dots */}
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                                <motion.span
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-amber-500"
                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="found"
                        className="flex flex-col items-center gap-8"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                    >
                        <motion.p
                            className="text-xs font-black tracking-[0.4em] uppercase text-amber-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            Combat trouvé
                        </motion.p>

                        <div className="flex flex-row items-center gap-16">
                            {/* Found map */}
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
                                    Carte
                                </span>
                                <div className="relative h-72 w-80 overflow-hidden rounded-2xl border border-amber-500/60 shadow-lg shadow-amber-500/10">
                                    {foundMap ? (
                                        <>
                                            {resolveMapThumbnailUrl(foundMap.thumbnail) ? (
                                                <img
                                                    src={resolveMapThumbnailUrl(foundMap.thumbnail)!}
                                                    alt={foundMap.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-slate-800" />
                                            )}
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
                                            <span className="absolute bottom-4 left-0 right-0 text-center text-sm font-bold tracking-wide text-white">
                                                {foundMap.name}
                                            </span>
                                        </>
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-800">
                                            <span className="text-xs text-slate-500">—</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 text-slate-600">
                                <span className="text-2xl font-black">VS</span>
                            </div>

                            {/* Found opponent */}
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">
                                    Adversaire
                                </span>
                                <div className="flex h-72 w-80 flex-col items-center justify-center gap-4 rounded-2xl border border-amber-500/60 bg-slate-900/80 shadow-lg shadow-amber-500/10">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-3xl font-black text-white">
                                        {foundOpponentName?.charAt(0) ?? "?"}
                                    </div>
                                    <span className="text-lg font-bold tracking-wide text-white">
                                        {foundOpponentName ?? "Adversaire"}
                                    </span>
                                    <span className="text-xs font-black tracking-[0.25em] text-amber-400">
                                        {foundFight.opponent.ranking.eloBefore} ELO
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>,
        document.body,
    )
}

export default MatchmakingOverlay

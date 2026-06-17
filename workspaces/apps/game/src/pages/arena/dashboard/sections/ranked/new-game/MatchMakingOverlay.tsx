// new-game/MatchmakingOverlay.tsx

import { motion } from "framer-motion"
import { createPortal } from "react-dom"
import type { MatchmakingProfile } from "./MatchMakingProfileCard"
import MatchmakingProfileCard from "./MatchMakingProfileCard"

const PLACEHOLDER_PROFILES: MatchmakingProfile[] = [
    { id: "p1", name: "Valtor", rating: 1480 },
    { id: "p2", name: "Nyx", rating: 1325 },
    { id: "p3", name: "Korrak", rating: 1602 },
    { id: "p4", name: "Selene", rating: 1218 },
    { id: "p5", name: "Drex", rating: 1555 },
    { id: "p6", name: "Maw", rating: 1390 },
    { id: "p7", name: "Ophir", rating: 1471 },
    { id: "p8", name: "Vesper", rating: 1284 },
]

interface MatchmakingOverlayProps {
    profiles?: MatchmakingProfile[]
}

const MatchmakingOverlay: React.FC<MatchmakingOverlayProps> = ({ profiles = PLACEHOLDER_PROFILES }) => {
    return createPortal(
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-slate-950/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.h3
                className="text-sm font-black tracking-[0.3em] uppercase text-amber-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
                Recherche d'un adversaire
            </motion.h3>

            <MatchmakingProfileCard profiles={profiles} />

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
        </motion.div>,
        document.body,
    )
}

export default MatchmakingOverlay
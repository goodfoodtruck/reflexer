import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

export type MatchmakingProfile = {
    id: string
    name: string
    rating: number
}

const avatarHue = (name: string): number => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return Math.abs(hash) % 360
}

interface MatchmakingProfileCardProps {
    profiles: MatchmakingProfile[]
    intervalMs?: number 
}

const MatchmakingProfileCard: React.FC<MatchmakingProfileCardProps> = ({ profiles, intervalMs = 500 }) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (profiles.length <= 1) return
        const id = setInterval(() => {
            setIndex(prev => (prev + 1) % profiles.length)
        }, intervalMs)
        return () => clearInterval(id)
    }, [profiles.length, intervalMs])

    const profile = profiles[index]

    return (
        <div className="relative h-48 w-64" style={{ perspective: "1200px" }} aria-hidden>
            <motion.div
                className="absolute inset-0 rounded-2xl border border-amber-500/40"
                animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.97, 1.03, 0.97] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            />

            <AnimatePresence>
                <motion.div
                    key={profile.id}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-900/80 p-5"
                    initial={{ opacity: 0, y: 18, scale: 0.92, rotateX: -18 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, y: -18, scale: 0.92, rotateX: 18 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                    <div
                        className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white bg-slate-600"
                    >
                        {profile.name.charAt(0)}
                    </div>
                    <span className="text-base font-bold tracking-wide text-white">{profile.name}</span>
                    <span className="text-xs font-black tracking-[0.25em] text-amber-400">{profile.rating}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default MatchmakingProfileCard
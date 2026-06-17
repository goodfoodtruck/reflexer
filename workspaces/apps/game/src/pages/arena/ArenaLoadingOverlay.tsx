import { motion, useReducedMotion } from "framer-motion"

interface LoadingOverlayProps {
    label?: string
    variant?: "solid" | "overlay"
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ label = "Chargement…", variant = "solid" }) => {
    const reduceMotion = useReducedMotion()
    const backdrop = variant === "overlay" ? "bg-slate-950/60 backdrop-blur-sm" : "bg-slate-950/90 backdrop-blur-sm"

    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 ${backdrop}`}
        >
            <div className="relative h-16 w-16">
                <motion.div
                    className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl"
                    animate={reduceMotion ? undefined : { scale: [0.8, 1.15, 0.8], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.svg
                    viewBox="0 0 50 50"
                    className="relative h-full w-full"
                    animate={reduceMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <circle cx="25" cy="25" r="20" fill="none" className="stroke-slate-700/50" strokeWidth="4" />
                    <circle
                        cx="25" cy="25" r="20" fill="none"
                        className="stroke-amber-500" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray="40 200"
                    />
                </motion.svg>
            </div>

            <motion.span
                className="text-xs font-black tracking-[0.3em] uppercase text-slate-400"
                animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
                {label}
            </motion.span>
        </div>
    )
}

export default LoadingOverlay
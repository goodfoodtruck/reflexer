import { motion } from "framer-motion"

interface FighterCardProps {
    name: string
    role: string
    avatarUrl?: string
    side: "left" | "right"
    roleColorClass: string
}

export const FighterCard: React.FC<FighterCardProps> = ({
    name,
    role,
    avatarUrl,
    side,
    roleColorClass
}) => {
    return (
        <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{
                x: side === "left" ? -120 : 120,
                opacity: 0
            }}
            animate={{
                x: 0,
                opacity: 1
            }}
            transition={{
                type: "spring",
                duration: 0.6,
                bounce: 0.2
            }}
        >
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    className="
                        w-32 h-32
                        rounded-full
                        overflow-hidden
                        border-4 border-slate-700
                        bg-slate-800
                        shadow-xl
                    "
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        delay: 0.2,
                        bounce: 0.35
                    }}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                            ⚔️
                        </div>
                    )}
                </motion.div>

                <div className="text-center">
                    <p className="text-xl font-black tracking-widest uppercase text-white">
                        {name}
                    </p>

                    <p
                        className={`
                            mt-1
                            text-[10px]
                            font-bold
                            tracking-[0.3em]
                            uppercase
                            ${roleColorClass}
                        `}
                    >
                        {role}
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
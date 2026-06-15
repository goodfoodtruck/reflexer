import { motion } from "framer-motion"
interface NewGameButtonProps {
    findMatch: () => Promise<void>
    isSearching: boolean
}

const NewGameButton: React.FC<NewGameButtonProps> = ({ findMatch, isSearching }) => {
    return (
        <motion.button
            onClick={findMatch}
            disabled={isSearching}
            className="w-max p-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            {isSearching ? (
                <span className="flex items-center justify-center gap-3">
                    <motion.span
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Recherche d'un adversaire...
                </span>
            ) : (
                "Nouvelle partie classée"
            )}
        </motion.button>
    )
}

export default NewGameButton
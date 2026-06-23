import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

interface CharacterRequireGambit {
  onClose: () => void
  missingCharacterNames: string[]
}

export function CharacterRequireGambit({ onClose, missingCharacterNames }: CharacterRequireGambit) {
  const navigate = useNavigate()

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col gap-4"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-black text-slate-100">Équipe pas prête</h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          Configure au moins un gambit pour chacun de tes 2 personnages avant de lancer un combat.
        </p>

        {missingCharacterNames.length > 0 && (
          <p className="text-xs text-amber-400 font-bold">
            Manque pour : {missingCharacterNames.join(", ")}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            onClick={() => navigate('/team')}
            className="flex-1 py-2.5 rounded-xl font-black text-sm bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors duration-200"
          >
            Configurer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
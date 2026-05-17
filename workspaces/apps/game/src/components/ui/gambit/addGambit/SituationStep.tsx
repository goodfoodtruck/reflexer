import { motion } from "framer-motion";
import type { DraftGambit } from "../GambitTypes";
import { InfoIcon } from "../../../../assets/icons/IconInfo";
import { INSPIRATIONS } from "../mockData";

const Styles = {
  container: "flex flex-col gap-8 h-full",
  eyebrow: "text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1",
  title: "text-2xl font-black text-white",
  sectionLabel: "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3",
  inputWrapper: "relative",
  input: "w-full bg-[#1A1D24] border border-[#2A2E39] rounded-lg px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-bold placeholder-slate-600",
  helperRow: "flex justify-between items-center mt-2 text-xs text-slate-500 font-medium",
  tagsContainer: "flex flex-wrap gap-2",
  tagBtn: "px-4 py-2 bg-[#1A1D24] border border-[#2A2E39] rounded-lg text-xs font-medium text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all",
  adviceBox: "col-span-1 bg-[#141720] border border-[#1E222D] rounded-xl p-5",
  adviceHeader: "flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4",
  adviceList: "flex flex-col gap-3 text-xs text-slate-400 leading-relaxed",
  adviceItem: "flex items-start gap-2",
  adviceDot: "w-1.5 h-1.5 rounded-full bg-amber-500/80 mt-1.5 shrink-0",
};

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function SituationStep({ draft, updateDraft }: Props) {
  const MAX_CHARS = 40;

  return (
    <motion.div 
      key="step1" 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      transition={{ duration: 0.2 }} 
      className={Styles.container}
    >
      
      <div>
        <p className={Styles.eyebrow}>Étape 1 · Situation</p>
        <h3 className={Styles.title}>Comment s'appelle ce gambit ?</h3>
      </div>

      <div>
        <p className={Styles.sectionLabel}>Nom du gambit</p>
        <div className={Styles.inputWrapper}>
          <input 
            type="text" 
            className={Styles.input} 
            placeholder="Nouveau gambit" 
            value={draft.name} 
            maxLength={MAX_CHARS}
            onChange={(e) => updateDraft({ name: e.target.value })} 
            autoFocus 
          />
        </div>
        <div className={Styles.helperRow}>
          <span>Un nom court et lisible aide à repérer le gambit dans la liste.</span>
          <span className={draft.name.length >= MAX_CHARS ? "text-amber-500" : "text-slate-600"}>
            {draft.name.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <div className={Styles.adviceBox}>
        <div className={Styles.adviceHeader}>
          <InfoIcon className="w-4 h-4" />
          Conseils
        </div>
        <ul className={Styles.adviceList}>
          <li className={Styles.adviceItem}>
            <div className={Styles.adviceDot} />
            <span>Court : 2 à 4 mots suffisent.</span>
          </li>
          <li className={Styles.adviceItem}>
            <div className={Styles.adviceDot} />
            <span>Orienté intention : « Soin d'urgence » {'>'} « Règle 1 ».</span>
          </li>
          <li className={Styles.adviceItem}>
            <div className={Styles.adviceDot} />
            <span>Lisible d'un coup d'œil dans la liste.</span>
          </li>
        </ul>
      </div>

      <div>
        <p className={Styles.sectionLabel}>Inspirations</p>
        <div className={Styles.tagsContainer}>
          {INSPIRATIONS.map(tag => (
            <button 
              key={tag} 
              onClick={() => updateDraft({ name: tag })} 
              className={Styles.tagBtn}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
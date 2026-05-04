import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { DraftGambit } from "../GambitTypes";
import { PlaceholderIcon } from "../../icons/IconPlaceholder";
import { EmptyDetailsIcon } from "../../icons/IconEmptyDetails";
import { ACTION_CATEGORIES } from "../mockData";

const Styles = {
  container: "flex flex-col h-full",
  headerBox: "mb-6",
  title: "text-2xl font-black text-white mb-2",
  subtitle: "text-sm text-slate-400 font-medium",
  layoutGrid: "flex gap-6 h-[400px]",
  colCategories: "w-44 shrink-0 flex flex-col gap-2 border-r border-slate-800 pr-4 overflow-y-auto custom-scrollbar",
  catLabel: "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-2",
  catBtnBase: "flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold w-full border",
  catBtnActive: "bg-amber-500/10 border-amber-500/50 text-amber-500",
  catBtnIdle: "bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200",
  colItems: "flex-1 grid grid-cols-3 gap-4 content-start overflow-y-auto custom-scrollbar pr-4 pb-4",
  actionCardBase: "group relative rounded-xl border flex flex-col items-center p-3 cursor-pointer transition-all bg-[#1A1D24] border-[#2A2E39] hover:bg-[#1f232b] hover:border-slate-500",
  actionCardActive: "bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500",
  actionCardIdle: "",
  actionIconWrapper: "w-full aspect-square rounded-lg bg-[#0A0C10] border border-[#2A2E39] flex items-center justify-center text-slate-500 overflow-hidden mb-3 shadow-inner",
  actionIconImg: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
  actionName: "text-xs font-bold text-center leading-tight text-slate-200 px-1",
  colDetails: "w-80 shrink-0 bg-[#141720] border border-[#1E222D] rounded-xl p-6 flex flex-col",
  emptyDetails: "h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm font-medium gap-3 opacity-50",
  detailHeader: "flex items-center gap-4 mb-13",
  detailIconBig: "w-20 h-20 bg-[#0A0C10] border border-[#2A2E39] flex items-center justify-center overflow-hidden flex-shrink-0",
  detailIconImg: "w-full h-full object-cover",
  detailTitle: "text-xl font-bold text-white",
  detailSubtitle: "text-sm font-medium text-slate-400 mt-1",
  detailTextRow: "text-sm text-slate-300 mb-2 flex items-center gap-1",
  detailTextBold: "font-bold text-white",
  detailSectionTitle: "text-base font-normal text-white mt-6 mb-3",
  detailEffectText: "text-sm text-slate-200 bg-[#47d14773] p-2 rounded-lg whitespace-pre-line",
  detailDesc: "text-sm text-slate-400 italic mt-auto pt-6",
};

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function IntentStep({ draft, updateDraft }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("cat_soin");

  const activeCategory = ACTION_CATEGORIES.find(c => c.id === activeCategoryId);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const selectedActionDetails = useMemo(() => {
    for (const cat of ACTION_CATEGORIES) {
      const found = cat.items.find(i => i.id === draft.intentValue);
      if (found) return { ...found, categoryName: cat.name };
    }
    return null;
  }, [draft.intentValue]);

  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className={Styles.container}>
      
      <div className={Styles.headerBox}>
        <h3 className={Styles.title}>Intention</h3>
        <p className={Styles.subtitle}>Que doit faire l'agent si la situation se présente ?</p>
      </div>

      <div className={Styles.layoutGrid}>
        
        <div className={Styles.colCategories}>
          <span className={Styles.catLabel}>Catégories</span>
          {ACTION_CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategoryId(cat.id)}
              className={`${Styles.catBtnBase} ${activeCategoryId === cat.id ? Styles.catBtnActive : Styles.catBtnIdle}`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        <div className={Styles.colItems}>
          {activeCategory?.items.map(action => (
            <button 
              key={action.id}
              onClick={() => updateDraft({ intentKind: action.kind, intentValue: action.id })}
              className={`${Styles.actionCardBase} ${draft.intentValue === action.id ? Styles.actionCardActive : Styles.actionCardIdle}`}
            >
              <div className={Styles.actionIconWrapper}>
                {action.image ? (
                  <img src={action.image} alt={action.name} className={Styles.actionIconImg} />
                ) : (
                  <PlaceholderIcon className="w-8 h-8" />
                )}
              </div>
              <span className={Styles.actionName}>{action.name}</span>
            </button>
          ))}
        </div>

        <div className={Styles.colDetails}>
          {selectedActionDetails ? (
            <>
              <div className={Styles.detailHeader}>
                <div className={Styles.detailIconBig}>
                   {selectedActionDetails.image ? (
                      <img src={selectedActionDetails.image} alt={selectedActionDetails.name} className={Styles.detailIconImg} />
                    ) : (
                      <PlaceholderIcon className="w-8 h-8" />
                    )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className={Styles.detailTitle}>{selectedActionDetails.name}</h4>
                  <span className={Styles.detailSubtitle}>{selectedActionDetails.categoryName}</span>
                </div>
              </div>

              <div className="flex flex-col">
                {selectedActionDetails.cost !== undefined && (
                  <div className={Styles.detailTextRow}>
                    Coût : <span className={Styles.detailTextBold}>{selectedActionDetails.cost}</span> énergie
                  </div>
                )}
                
                {selectedActionDetails.cibles && (
                  <div className={Styles.detailTextRow}>
                    Cible : <span className={Styles.detailTextBold}>{selectedActionDetails.cibles}</span>
                  </div>
                )}
              </div>

              {selectedActionDetails.effect && (
                <div>
                  <h5 className={Styles.detailSectionTitle}>Effets</h5>
                  <p className={Styles.detailEffectText}>
                    {selectedActionDetails.effect}
                  </p>
                </div>
              )}

              <p className={Styles.detailDesc}>
                {selectedActionDetails.description}
              </p>
            </>
          ) : (
            <div className={Styles.emptyDetails}>
              <EmptyDetailsIcon className="w-12 h-12 text-slate-700" />
              <p>Sélectionnez une action<br/>pour voir ses détails.</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
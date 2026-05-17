import { useState } from "react";
import { motion } from "framer-motion";
import type { DraftGambit } from "../GambitTypes";
import { IconSelf } from "../../../../assets/icons/IconSelf";
import { IconEnemy } from "../../../../assets/icons/IconEnemy";
import { IconAlly } from "../../../../assets/icons/IconAlly";
import { IconOther } from "../../../../assets/icons/IconOther";
import { IconEdit } from "../../../../assets/icons/IconEdit";
import { IconTrash } from "../../../../assets/icons/IconTrash";
import { FILTER_CATEGORIES, SORT_CATEGORIES } from "../mockData";
import { IconPlus } from "../../../../assets/icons/IconPlus";

const TARGET_KINDS = [
  { id: "SELF", label: "Self", icon: <IconSelf /> },
  { id: "ENEMY", label: "Enemy", icon: <IconEnemy /> },
  { id: "ALLY", label: "Ally", icon: <IconAlly /> },
  { id: "OTHER", label: "Other", icon: <IconOther /> },
];

const Styles = {
  container: "flex flex-col h-full text-slate-200",
  layoutCols: "flex flex-1 gap-6 items-center justify-center mt-4 h-[350px]",
  grid4: "grid grid-cols-4 gap-6",
  footer: "flex justify-between items-center mt-auto pt-6 border-t border-slate-800/50",
  title: "text-2xl font-black text-white mb-8 tracking-wide",
  breadcrumb: "text-[11px] font-black tracking-[0.2em] text-slate-500 mb-8 uppercase",
  activeBread: "text-amber-500",
  label: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2",
  cardBase: "group aspect-square flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-700/50 bg-[#161925]/60 cursor-pointer hover:border-amber-500/80 hover:bg-amber-500/5 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all duration-300",
  listItem: "px-4 py-3.5 rounded-xl text-[11px] font-black tracking-[0.1em] uppercase cursor-pointer transition-all border text-left",
  listItemActive: "bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  listItemIdle: "bg-[#161925] border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50",
  colList: "flex flex-col gap-2 w-56 h-full overflow-y-auto pr-2 border-l border-slate-800/50 pl-6 custom-scrollbar",
  baseBadge: "px-3 py-1.5 rounded text-[11px] font-bold tracking-widest uppercase",
  blockSolid: "bg-amber-500/10 border border-amber-500/30 text-amber-500 text-center w-full shadow-sm",
  blockDashed: "border border-dashed border-slate-700 text-slate-500 text-center w-full",
  blockContainer: "px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest",
  iconWrapper: "text-slate-500 group-hover:text-amber-500 transition-colors",
  avatarBox: "w-20 h-20 rounded-xl bg-[#0F111A] border border-amber-500/30 flex flex-col items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  smallIconBox: "w-16 h-16 rounded-xl border border-slate-700 bg-[#161925] flex items-center justify-center text-slate-400 mb-2",
  btnBase: "px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
  btnPrimary: "text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed",
  btnSecondary: "text-slate-400 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white",
  btnAction: "flex items-center gap-2 text-xs font-bold transition-colors",
  btnAdd: "w-full py-2 flex items-center justify-center border border-dashed border-slate-600 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-colors cursor-pointer",
  headerBar: "w-full bg-[#161925] border border-amber-500/30 px-4 py-3 rounded-lg text-xs font-black text-amber-500 mb-4",
  recapContainer: "bg-[#161925]/60 border border-slate-700/80 rounded-xl p-6 shadow-lg",
  recapGrid: "flex items-center gap-8",
  recapActions: "flex flex-col gap-3 border-l border-slate-700/50 pl-8"
};

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}
type FilterBlock = { categoryId: string; values: string[] };
type ConfiguredTarget = { kind: string; filters: FilterBlock[]; sortVal: string | null; };

export function TargetStep({ draft, updateDraft }: Props) {
  const [internalStep, setInternalStep] = useState<1 | 2 | 3>(1);
  const [configuredTarget, setConfiguredTarget] = useState<ConfiguredTarget | null>(() => {
    return draft.targetKind && draft.targetSort ? { kind: draft.targetKind, filters: [], sortVal: draft.targetSort } : null;
  });

  const [localKind, setLocalKind] = useState<DraftGambit['targetKind'] | null>(draft.targetKind || null);
  const [sortVal, setSortVal] = useState<string | null>(draft.targetSort || null);
  const [filterBlocks, setFilterBlocks] = useState<FilterBlock[]>([]);
  const [currentFilterCat, setCurrentFilterCat] = useState<string | null>(null);
  const [currentFilterVals, setCurrentFilterVals] = useState<string[]>([]);
  const [sortCat, setSortCat] = useState<string | null>(null);

  const formatBlockText = (catId: string, values: string[]) => {
    if (values.length === 0) return "";
    return catId === 'type' ? `DE TYPE ${values.join(" OU ")}` : values.join(" OU ");
  };

  const handleSaveInternal = () => {
    if (!localKind) return;
    setConfiguredTarget({ kind: localKind, filters: filterBlocks, sortVal: sortVal });
    setInternalStep(1);
    updateDraft({ targetKind: localKind as any, targetSort: sortVal || "NEAREST" });
  };

  if (internalStep === 1) {
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={Styles.container}>
        <div className={Styles.breadcrumb}>
          Configuration &gt; <span className={Styles.activeBread}>Type de cible</span>
        </div>
        <h3 className={Styles.title}>Cible du Gambit</h3>

        {configuredTarget ? (
          <div className="flex-1 flex flex-col mt-4">
            <div className={Styles.recapContainer}>
              <div className={Styles.recapGrid}>
                <div className={Styles.avatarBox}>
                  {TARGET_KINDS.find(t => t.id === configuredTarget.kind)?.icon}
                  <span className="text-[10px] font-black mt-2 tracking-[0.2em]">{configuredTarget.kind}</span>
                </div>
                
                <div className="flex flex-col gap-4 flex-1">
                  <div>
                    <span className={Styles.label}>Critères</span>
                    <div className="flex flex-wrap gap-2">
                      {configuredTarget.filters.length > 0 ? configuredTarget.filters.map((b, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {i > 0 && <span className="text-[10px] font-black text-slate-600">ET</span>}
                          <span className={`bg-slate-800/80 border border-slate-700 text-slate-300 ${Styles.baseBadge}`}>
                            {formatBlockText(b.categoryId, b.values)}
                          </span>
                        </div>
                      )) : <span className="text-xs text-slate-500 italic">Cible par défaut</span>}
                    </div>
                  </div>
                  <div>
                    <span className={Styles.label}>Priorité</span>
                    <span className={`${Styles.blockSolid} ${Styles.baseBadge} self-start`}>
                      {configuredTarget.sortVal?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className={Styles.recapActions}>
                  <button onClick={() => setInternalStep(2)} className={`${Styles.btnAction} text-slate-400 hover:text-amber-400`}><IconEdit /> Éditer</button>
                  <button onClick={() => { setConfiguredTarget(null); updateDraft({ targetKind: "ENEMY", targetSort: "" }); }} className={`${Styles.btnAction} text-slate-400 hover:text-rose-500`}><IconTrash /> Reset</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className={Styles.grid4}>
              {TARGET_KINDS.map(target => (
                <button key={target.id} onClick={() => { setLocalKind(target.id as any); setFilterBlocks([]); setSortVal(null); setInternalStep(2); }} className={Styles.cardBase}>
                  <div className={Styles.iconWrapper}>{target.icon}</div>
                  <span className="text-xs font-black uppercase tracking-widest">{target.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  if (internalStep === 2) {
    const activeIcon = TARGET_KINDS.find(t => t.id === localKind)?.icon;
    const catOptions = currentFilterCat ? FILTER_CATEGORIES.find(c => c.id === currentFilterCat)?.options || [] : [];

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={Styles.container}>
        <div className={Styles.breadcrumb}>Cible &gt; <span className={Styles.activeBread}>Critères</span></div>
        <div className={Styles.headerBar}>{localKind}: <span className="text-slate-300">{filterBlocks.map(b => `(${formatBlockText(b.categoryId, b.values)})`).join(" ET ")}</span></div>
        <div className={Styles.layoutCols}>
          <div className="flex flex-col items-center gap-2 min-w-[200px]">
            <div className={Styles.smallIconBox}>{activeIcon}</div>
            <div className="flex flex-col gap-2 w-full">
              {filterBlocks.map((b, i) => <div key={i} className={`${Styles.blockContainer} ${Styles.blockSolid}`}>{formatBlockText(b.categoryId, b.values)}</div>)}
              {currentFilterVals.length > 0 ? (
                <>
                  <div className={`${Styles.blockContainer} ${Styles.blockSolid}`}>{formatBlockText(currentFilterCat!, currentFilterVals)}</div>
                  <button onClick={() => { setFilterBlocks(prev => [...prev, { categoryId: currentFilterCat!, values: currentFilterVals }]); setCurrentFilterCat(null); setCurrentFilterVals([]); }} className={Styles.btnAdd}><IconPlus /></button>
                </>
              ) : <div className={`${Styles.blockContainer} ${Styles.blockDashed}`}>Filtre Optionnel</div>}
            </div>
          </div>
          <div className={Styles.colList}>
            {FILTER_CATEGORIES.map(cat => <button key={cat.id} onClick={() => { setCurrentFilterCat(cat.id); setCurrentFilterVals([]); }} className={`${Styles.listItem} ${currentFilterCat === cat.id ? Styles.listItemActive : Styles.listItemIdle}`}>{cat.label}</button>)}
          </div>
          <div className={Styles.colList}>
            {currentFilterCat && catOptions.map(val => <button key={val} onClick={() => setCurrentFilterVals(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])} className={`${Styles.listItem} ${currentFilterVals.includes(val) ? Styles.listItemActive : Styles.listItemIdle}`}>{val}</button>)}
          </div>
        </div>
        <div className={Styles.footer}>
          <button onClick={() => setInternalStep(1)} className={`${Styles.btnBase} ${Styles.btnSecondary}`}>Annuler</button>
          <button onClick={() => setInternalStep(3)} className={`${Styles.btnBase} ${Styles.btnPrimary}`}>Suivant</button>
        </div>
      </motion.div>
    );
  }

  const activeIconFinal = TARGET_KINDS.find(t => t.id === localKind)?.icon;
  const sortOptions = sortCat ? SORT_CATEGORIES.find(c => c.id === sortCat)?.options || [] : [];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={Styles.container}>
      <div className={Styles.breadcrumb}>Critères &gt; <span className={Styles.activeBread}>Priorité</span></div>
      <div className={Styles.headerBar}>{localKind}: <span className="text-slate-300">{sortVal || "Sélectionnez un tri"}</span></div>
      <div className={Styles.layoutCols}>
        <div className="flex flex-col items-center gap-2 min-w-[200px]"><div className={Styles.smallIconBox}>{activeIconFinal}</div></div>
        <div className={Styles.colList}>
          {SORT_CATEGORIES.map(cat => <button key={cat.id} onClick={() => { setSortCat(cat.id); setSortVal(null); }} className={`${Styles.listItem} ${sortCat === cat.id ? Styles.listItemActive : Styles.listItemIdle}`}>{cat.label}</button>)}
        </div>
        <div className={Styles.colList}>
          {sortCat && sortOptions.map(val => <button key={val} onClick={() => setSortVal(val)} className={`${Styles.listItem} ${sortVal === val ? Styles.listItemActive : Styles.listItemIdle}`}>{val}</button>)}
        </div>
      </div>
      <div className={Styles.footer}>
        <button onClick={() => setInternalStep(2)} className={`${Styles.btnBase} ${Styles.btnSecondary}`}>Retour</button>
        <button onClick={handleSaveInternal} disabled={!sortVal} className={`${Styles.btnBase} ${Styles.btnPrimary}`}>Enregistrer</button>
      </div>
    </motion.div>
  );
}
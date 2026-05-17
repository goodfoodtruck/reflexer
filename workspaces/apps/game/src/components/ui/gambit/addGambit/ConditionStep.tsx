import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ConditionBlock, DraftCondition, DraftGambit, SavedCondition } from "../GambitTypes";
import { IconSelf } from "../../../../assets/icons/IconSelf";
import { IconOther } from "../../../../assets/icons/IconOther";
import { IconAlly } from "../../../../assets/icons/IconAlly";
import { IconEnemy } from "../../../../assets/icons/IconEnemy";
import { CRITERIA_DATA_CONDITION_STEP } from "../mockData";
import { IconArrows } from "../../../../assets/icons/IconArrows";
import { IconPlus } from "../../../../assets/icons/IconPlus";

const TARGET_OPTIONS = [
  { id: "SELF", label: "Self", icon: <IconSelf /> },
  { id: "ENEMY", label: "Enemy", icon: <IconEnemy /> },
  { id: "ALLY", label: "Ally", icon: <IconAlly /> },
  { id: "OTHER", label: "Other", icon: <IconOther /> },
];

const Styles = {
  container: "flex flex-col h-full",
  navHeader: "flex items-center gap-2 text-[11px] font-black text-slate-500 mb-8 uppercase tracking-[0.2em]",
  navActive: "text-amber-500",
  navSeparator: "text-slate-700",
  visualBar: "flex items-center gap-4 mb-8 p-5 bg-[#161925]/80 rounded-2xl border border-slate-700/50 shadow-inner",
  visualBox: "w-14 h-14 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative",
  visualBoxFull: "border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-transparent text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  visualBoxAdd: "border-dashed border-slate-600 bg-[#0F111A] text-slate-500 hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5",
  visualAnd: "text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase",
  divider: "w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-8",
  gridWrapper: "flex-1 flex flex-col items-center pt-8",
  gridTitle: "text-2xl font-black text-white mb-8 tracking-wide",
  gridDisplay: "grid grid-cols-4 gap-6",
  gridCard: "group relative w-36 aspect-square flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-700/50 bg-[#161925]/60 cursor-pointer hover:border-amber-500/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] overflow-hidden transition-all duration-300 hover:-translate-y-1",
  gridIconBox: "relative w-16 h-16 rounded-xl bg-[#0F111A] border border-slate-700/50 flex items-center justify-center text-slate-500 transition-all duration-300 group-hover:text-amber-500 group-hover:border-amber-500/50 z-10",
  gridIconGlow: "absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
  gridLabel: "text-[11px] font-black tracking-[0.1em] text-slate-400 uppercase group-hover:text-amber-400 z-10",
  banner: "relative w-full overflow-hidden bg-[#161925] border-l-4 border-amber-500 text-slate-200 font-black px-6 py-4 rounded-xl shadow-lg mb-8 flex items-center tracking-wide text-xs",
  bannerGlow: "absolute top-0 left-1/4 w-1/2 h-full bg-amber-500/10 blur-3xl",
  workArea: "flex-1 bg-[#0F111A]/50 rounded-2xl border border-slate-800/50 p-6 flex flex-col justify-center relative overflow-hidden",
  workLayout: "flex items-center gap-8 overflow-x-auto custom-scrollbar pb-6 px-2",
  focusIconWrapper: "relative shrink-0",
  focusIconGlow: "absolute inset-0 bg-amber-500/20 blur-2xl rounded-full",
  focusIconBox: "relative w-28 h-28 rounded-2xl bg-[#0F111A] border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center text-amber-500 gap-2 z-10",
  stackWrapper: "flex flex-col items-center gap-3 shrink-0",
  stackItem: "px-5 py-3.5 rounded-xl text-[11px] font-black bg-[#161925] border border-slate-700/50 text-slate-300 text-center min-w-[160px] shadow-lg",
  stackItemActive: "border-amber-500/40 bg-amber-500/10 text-amber-500 border-dashed",
  stackItemEmpty: "border-dashed border-slate-700 bg-transparent text-slate-500 opacity-50",
  stackAnd: "text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase",
  stackAddBtn: "w-full py-3 rounded-xl border border-dashed border-slate-600 text-slate-500 bg-[#0F111A] hover:bg-[#161925] hover:border-amber-500/50 hover:text-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all flex justify-center items-center cursor-pointer",
  listPane: "flex flex-col gap-2.5 w-60 shrink-0 h-[280px] overflow-y-auto custom-scrollbar pr-3 border-l border-slate-800/50 pl-8 relative",
  listItem: "relative w-full px-5 py-3.5 rounded-xl text-[11px] font-black cursor-pointer transition-all border overflow-hidden group tracking-[0.1em] uppercase",
  listSelected: "bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  listIdle: "bg-[#161925] border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50",
  footer: "flex justify-end gap-4 mt-auto pt-8 border-t border-slate-800/50",
  btnBase: "px-8 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
  btnSec: "text-slate-400 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white",
  btnPri: "text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 border border-orange-400/50"
};

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function ConditionStep({ draft, updateDraft }: Props) {
  const [viewMode, setViewMode] = useState<"SELECT_TARGET" | "BUILD_CONDITION">("SELECT_TARGET");
  const [activeTargetContext, setActiveTargetContext] = useState<string | null>(null);
  
  const [savedConditions, setSavedConditions] = useState<SavedCondition[]>(() => {
    if (!draft.conditions || draft.conditions.length === 0) return [];
    const grouped: Record<string, ConditionBlock[]> = {};
    draft.conditions.forEach(c => {
      if (!grouped[c.scopeKind]) grouped[c.scopeKind] = [];
      grouped[c.scopeKind].push({ categoryId: c.filterType, values: c.value.toString().split(',') });
    });
    return Object.keys(grouped).map(targetId => ({ targetId, blocks: grouped[targetId] }));
  });

  const [configuredTargets, setConfiguredTargets] = useState<string[]>(() => {
    if (!draft.conditions) return [];
    return Array.from(new Set(draft.conditions.map(c => c.scopeKind)));
  });

  const [blocks, setBlocks] = useState<ConditionBlock[]>([]);
  const [currentCat, setCurrentCat] = useState<string | null>(null);
  const [currentValues, setCurrentValues] = useState<string[]>([]);

  useEffect(() => {
    const formattedConditions: DraftCondition[] = savedConditions.flatMap((cond) => {
      const scope = (["SELF", "ALLY", "ENEMY"].includes(cond.targetId) ? cond.targetId : "ENEMY") as "SELF" | "ALLY" | "ENEMY";
      return cond.blocks.map((block, index) => {
        let type: any = block.categoryId;
        let val: any = 0;
        if (block.categoryId === "health") {
          type = "HP_BELOW";
          const match = block.values[0]?.match(/\d+/);
          if (match) val = parseInt(match[0], 10);
        } else if (block.categoryId.includes("distance")) {
          type = "IN_RANGE";
          val = block.values[0]?.includes("FAIBLE") ? 1 : block.values[0]?.includes("MOYENNE") ? 3 : 5;
        } else {
          val = block.values.join(",");
        }
        return { id: `temp-${cond.targetId}-${block.categoryId}-${index}`, scopeKind: scope, filterType: type, value: val };
      });
    });
    updateDraft({ conditions: formattedConditions });
  }, [savedConditions, updateDraft]);

  const formatBlockText = (catId: string, values: string[]) => {
    if (values.length === 0) return "";
    if (catId === 'health') return values.join(" OU ");
    if (catId === 'status') return `STATUS: ${values.join("/")}`;
    return values.join(" OU ");
  };

  const buildBannerText = () => {
    if (!activeTargetContext) return "";
    const all = [...blocks];
    if (currentCat && currentValues.length > 0) all.push({ categoryId: currentCat, values: currentValues });
    const parts = all.map(b => formatBlockText(b.categoryId, b.values));
    return `${activeTargetContext} : ${parts.length > 0 ? parts.join(" ET ") : "(SÉLECTIONNEZ UN CRITÈRE)"}`.toUpperCase();
  };

  const handleSaveConditionGroup = () => {
    const final = [...blocks];
    if (currentCat && currentValues.length > 0) final.push({ categoryId: currentCat, values: currentValues });
    if (activeTargetContext) {
      if (final.length > 0) {
        setSavedConditions(prev => [...prev.filter(c => c.targetId !== activeTargetContext), { targetId: activeTargetContext, blocks: final }]);
        if (!configuredTargets.includes(activeTargetContext)) setConfiguredTargets(prev => [...prev, activeTargetContext]);
      } else {
        setSavedConditions(prev => prev.filter(c => c.targetId !== activeTargetContext));
        setConfiguredTargets(prev => prev.filter(t => t !== activeTargetContext));
      }
    }
    setBlocks([]); setCurrentCat(null); setCurrentValues([]); setViewMode("SELECT_TARGET");
  };

  const handleSelectTarget = (id: string) => {
    const exist = savedConditions.find(c => c.targetId === id);
    setBlocks(exist ? [...exist.blocks] : []);
    setCurrentCat(null); setCurrentValues([]); setActiveTargetContext(id); setViewMode("BUILD_CONDITION");
  };

  if (viewMode === "BUILD_CONDITION") {
    const activeIcon = TARGET_OPTIONS.find(t => t.id === activeTargetContext)?.icon;
    const catOpts = currentCat ? CRITERIA_DATA_CONDITION_STEP.find(c => c.id === currentCat)?.options || [] : [];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={Styles.container}>
        <div className={Styles.navHeader}>
          <span className="cursor-pointer hover:text-slate-300" onClick={() => setViewMode("SELECT_TARGET")}>RAJOUTER UNE CONDITION</span>
          <span className={Styles.navSeparator}>&gt;</span>
          <span className={Styles.navActive}>QUELS CRITÈRES ?</span>
        </div>
        <div className={Styles.banner}>
          <div className={Styles.bannerGlow} /><span className="relative z-10">{buildBannerText()}</span>
        </div>
        <div className={Styles.workArea}>
          <div className={Styles.workLayout}>
            <div className={Styles.focusIconWrapper}>
              <div className={Styles.focusIconGlow} />
              <div className={Styles.focusIconBox}>{activeIcon}<span className="text-[10px] font-black uppercase tracking-[0.2em]">{activeTargetContext}</span></div>
            </div>
            <IconArrows />
            <div className={Styles.stackWrapper}>
              {blocks.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className={Styles.stackItem}>{formatBlockText(b.categoryId, b.values)}</div>
                  <span className={Styles.stackAnd}>ET</span>
                </div>
              ))}
              {currentValues.length > 0 ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className={`${Styles.stackItem} ${Styles.stackItemActive}`}>{formatBlockText(currentCat!, currentValues)}</div>
                  <button className={Styles.stackAddBtn} onClick={() => { setBlocks(p => [...p, { categoryId: currentCat!, values: currentValues }]); setCurrentCat(null); setCurrentValues([]); }}><IconPlus /></button>
                </div>
              ) : <div className={`${Styles.stackItem} ${Styles.stackItemEmpty}`}>(Choisissez une catégorie)</div>}
            </div>
            <IconArrows />
            <div className={Styles.listPane}>
              {CRITERIA_DATA_CONDITION_STEP.map(cat => (
                <button key={cat.id} onClick={() => { setCurrentCat(cat.id); setCurrentValues([]); }} className={`${Styles.listItem} ${currentCat === cat.id ? Styles.listSelected : Styles.listIdle}`}><span className="relative z-10">{cat.label}</span></button>
              ))}
            </div>
            {currentCat && (
              <><IconArrows />
                <div className={Styles.listPane}>
                  {catOpts.map(v => (
                    <button key={v} onClick={() => setCurrentValues(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])} className={`${Styles.listItem} ${currentValues.includes(v) ? Styles.listSelected : Styles.listIdle}`}><span className="relative z-10">{v}</span></button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className={Styles.footer}>
          <button className={`${Styles.btnBase} ${Styles.btnSec}`} onClick={() => setViewMode("SELECT_TARGET")}>Annuler</button>
          <button className={`${Styles.btnBase} ${Styles.btnPri}`} onClick={handleSaveConditionGroup} disabled={blocks.length === 0 && currentValues.length === 0}>Enregistrer</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className={Styles.container}>
      <div className={Styles.navHeader}><span className={Styles.navActive}>RAJOUTER UNE CONDITION</span><span className={Styles.navSeparator}>&gt;</span><span>CIBLE</span></div>
      <div className={Styles.visualBar}>
        {configuredTargets.map((t, i) => (
          <div key={i} className="flex items-center gap-4">
            <div onClick={() => handleSelectTarget(t)} className={`${Styles.visualBox} ${Styles.visualBoxFull}`}>{TARGET_OPTIONS.find(x => x.id === t)?.icon}</div>
            <span className={Styles.visualAnd}>ET</span>
          </div>
        ))}
        <div className={`${Styles.visualBox} ${Styles.visualBoxAdd}`}><IconPlus /></div>
      </div>
      <div className={Styles.divider} />
      <div className={Styles.gridWrapper}>
        <h3 className={Styles.gridTitle}>Sélectionner une cible</h3>
        <div className={Styles.gridDisplay}>
          {TARGET_OPTIONS.map((t) => (
            <button key={t.id} onClick={() => handleSelectTarget(t.id)} className={Styles.gridCard}>
              <div className={Styles.gridIconGlow} /><div className={Styles.gridIconBox}>{t.icon}</div><span className={Styles.gridLabel}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
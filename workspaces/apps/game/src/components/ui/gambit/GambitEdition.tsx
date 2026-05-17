import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { DraftCondition, DraftGambit, RealGambit } from "./GambitTypes";
import { SituationStep } from "./addGambit/SituationStep";
import { IntentStep } from "./addGambit/IntentStep";
import { ConditionStep } from "./addGambit/ConditionStep";
import { TargetStep } from "./addGambit/TargetStep";

const Styles = {
  container: "h-full flex flex-col relative",
  header: "px-8 py-6 border-b border-slate-700/50 bg-slate-800/30",
  timeline: "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 -z-10",
  stepWrapper: "flex flex-col items-center gap-2 bg-slate-900 px-4 relative z-10",
  circle: "w-10 h-10 rounded-full font-black flex items-center justify-center border-4 border-slate-900 transition-colors duration-500",
  circleActive: "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
  circlePending: "bg-slate-800 text-slate-500 font-bold",
  label: "text-xs font-bold uppercase tracking-widest",
  labelActive: "text-amber-500",
  labelPending: "text-slate-500",
  body: "flex-1 p-8 overflow-y-auto relative custom-scrollbar",
  glow: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none",
  content: "relative z-10 mx-auto w-full pt-4 transition-all duration-500",
  footer: "p-6 border-t border-slate-700/50 bg-slate-950/50 flex justify-between items-center",
  footerRight: "flex items-center gap-4",
  btnBase: "px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all",
  btnCancel: "text-slate-500 hover:text-rose-400",
  btnBack: "text-slate-400 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg",
  btnNext: "px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black rounded-lg shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
};

interface GambitEditionProps {
  initialGambit?: RealGambit;
  onCancel: () => void;
  onSave: (gambit: DraftGambit) => void;
}

export function GambitEdition({ initialGambit, onCancel, onSave }: GambitEditionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [draft, setDraft] = useState<DraftGambit>(() => {
    if (!initialGambit) {
      return { name: "", operator: "AND", conditions: [], intentKind: "ACTION", intentValue: "", targetKind: "ENEMY", targetSort: "" };
    }

    const nameParts = initialGambit.id.split('_');
    if (!isNaN(Number(nameParts[nameParts.length - 1]))) nameParts.pop(); 

    const extractDraftConditions = (cond: any): DraftCondition[] => {
      if (!cond) return [];
      if (cond.type === "EXISTS") {
        return [{
          id: `loaded-${Math.random().toString(36).substr(2, 9)}`,
          scopeKind: cond.scope?.kind || "ENEMY",
          filterType: cond.scope?.filter?.type || "",
          value: cond.scope?.filter?.threshold || cond.scope?.filter?.range || cond.scope?.filter?.status || ""
        }];
      }
      if (cond.operator === "NOT" && cond.condition) return extractDraftConditions(cond.condition);
      if ((cond.operator === "AND" || cond.operator === "OR") && Array.isArray(cond.conditions)) return cond.conditions.flatMap(extractDraftConditions);
      return [];
    };

    return {
      name: nameParts.join(' ').toUpperCase(),
      operator: (initialGambit.conditions as any).operator || "AND",
      conditions: extractDraftConditions(initialGambit.conditions),
      intentKind: initialGambit.intent.kind,
      intentValue: initialGambit.intent.kind === "MOVEMENT" ? (initialGambit.intent.strategy || "") : (initialGambit.intent.action?.id || ""),
      targetKind: initialGambit.targetSelector.context.kind as any,
      targetSort: initialGambit.targetSelector.sort || "NEAREST"
    };
  });

  const handleNextOrSave = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
    else onSave(draft);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const updateDraft = (updates: Partial<DraftGambit>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1: return <SituationStep draft={draft} updateDraft={updateDraft} />;
      case 2: return <ConditionStep draft={draft} updateDraft={updateDraft} />;
      case 3: return <IntentStep draft={draft} updateDraft={updateDraft} />;
      case 4: return <TargetStep draft={draft} updateDraft={updateDraft} />;
      default: return null;
    }
  };

  const isDisabled = () => (currentStep === 1 && draft.name === "") || (currentStep === 3 && draft.intentValue === "");

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <div className="flex items-center justify-between relative">
          <div className={Styles.timeline} />
          {[ 
            { num: 1, label: "Situation" }, 
            { num: 2, label: "Conditions" }, 
            { num: 3, label: "Intention" }, 
            { num: 4, label: "Cible" } 
          ].map((s) => (
            <div key={s.num} className={Styles.stepWrapper}>
              <div className={`${Styles.circle} ${currentStep >= s.num ? Styles.circleActive : Styles.circlePending}`}>
                {s.num}
              </div>
              <span className={`${Styles.label} ${currentStep >= s.num ? Styles.labelActive : Styles.labelPending}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className={Styles.body}>
        <div className={Styles.glow} />
        <div className={`${Styles.content} ${currentStep >= 2 ? "max-w-7xl" : "max-w-xl"}`}>
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>
      </div>
      
      <div className={Styles.footer}>
        <button onClick={onCancel} className={`${Styles.btnBase} ${Styles.btnCancel}`}>Annuler</button>
        <div className={Styles.footerRight}>
          {currentStep > 1 && (
            <button onClick={handlePrev} className={`${Styles.btnBase} ${Styles.btnBack}`}>Retour</button>
          )}
          <button onClick={handleNextOrSave} className={`${Styles.btnBase} ${Styles.btnNext}`} disabled={isDisabled()}>
            {currentStep === 4 ? "Terminer & Sauvegarder" : "Étape suivante"}
          </button>
        </div>
      </div>
    </div>
  );
}
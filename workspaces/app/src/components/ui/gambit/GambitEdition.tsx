import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { DraftGambit } from "./GambitTypes";
import { SituationStep } from "./addGambit/SituationStep";
import { IntentStep } from "./addGambit/IntentStep";

const LayoutStyles = {
  container: "h-full flex flex-col relative",
  header: "px-8 py-6 border-b border-slate-700/50 bg-slate-800/30",
  timelineLine: "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 -z-10",
  stepCircleBase: "w-10 h-10 rounded-full font-black flex items-center justify-center border-4 border-slate-900 transition-colors duration-500",
  stepCircleActive: "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
  stepCirclePending: "bg-slate-800 text-slate-500 font-bold",
  stepLabelBase: "text-xs font-bold uppercase tracking-widest",
  stepLabelActive: "text-amber-500",
  stepLabelPending: "text-slate-500",
  body: "flex-1 p-8 overflow-y-auto relative custom-scrollbar",
  glow: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none",
  footer: "p-6 border-t border-slate-700/50 bg-slate-950/50 flex justify-between items-center",
  btnCancel: "px-6 py-3 text-sm font-bold tracking-widest text-slate-400 hover:text-white transition-colors uppercase",
  btnNext: "px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-black tracking-widest rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 uppercase disabled:opacity-50",
};

interface GambitEditionProps {
  onCancel: () => void;
  onSave: (gambit: DraftGambit) => void;
}

export function GambitEdition({ onCancel, onSave }: GambitEditionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<DraftGambit>({
    name: "", 
    operator: "AND",
    conditions: [], 
    intentKind: "ACTION", 
    intentValue: "", 
    targetKind: "ENEMY",
    targetSort: ""
  });

  const handleNextOrSave = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
    else onSave(draft);
  };

  const updateDraft = (updates: Partial<DraftGambit>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1: return <SituationStep draft={draft} updateDraft={updateDraft} />;
      case 3: return <IntentStep draft={draft} updateDraft={updateDraft} />;
      default: return null;
    }
  };

  const isDisabled = () => {
    return (currentStep === 1 && draft.name === "") || (currentStep === 3 && draft.intentValue === "")
  }

  return (
    <div className={LayoutStyles.container}>
      <div className={LayoutStyles.header}>
        <div className="flex items-center justify-between relative">
          <div className={LayoutStyles.timelineLine}></div>
          {[ { num: 1, label: "Situation" }, { num: 2, label: "Conditions" }, { num: 3, label: "Intention" }, { num: 4, label: "Cible" } ].map((step) => (
            <div key={step.num} className="flex flex-col items-center gap-2 bg-slate-900 px-4 relative z-10">
              <div className={`${LayoutStyles.stepCircleBase} ${currentStep >= step.num ? LayoutStyles.stepCircleActive : LayoutStyles.stepCirclePending}`}>{step.num}</div>
              <span className={`${LayoutStyles.stepLabelBase} ${currentStep >= step.num ? LayoutStyles.stepLabelActive : LayoutStyles.stepLabelPending}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className={LayoutStyles.body}>
        <div className={LayoutStyles.glow}></div>
        <div className={`relative z-10 mx-auto w-full pt-4 transition-all duration-500 ${currentStep === 3 ? "max-w-7xl" : "max-w-xl"}`}>
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </div>
      </div>
      
      <div className={LayoutStyles.footer}>
        <button onClick={onCancel} className={LayoutStyles.btnCancel}>Annuler</button>
        <button 
          onClick={handleNextOrSave} 
          className={LayoutStyles.btnNext} 
          disabled={isDisabled()}
        >
          {currentStep === 4 ? "Terminer & Sauvegarder" : "Étape suivante"}
        </button>
      </div>
    </div>
  );
}
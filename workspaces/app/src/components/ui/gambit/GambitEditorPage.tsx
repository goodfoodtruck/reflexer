import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GambitRow, type UIGambit } from "./GambitRow";
import { AnimatedBackground } from "../AnimatedBackground";
import { Header } from "../header/Header";
import heroM from "../../../assets/images/hero-m.png"; 
import heroW from "../../../assets/images/hero-w.png";

//MOCK TODO : a verifier
const INITIAL_GAMBITS: UIGambit[] = [
  { id: "g1", conditionLabel: "Ennemi attaque Allié", targetLabel: "Ennemi ciblé", actionLabel: "Frappe Lourde" },
  { id: "g2", conditionLabel: "Armure > 50% ET PV < 25%", targetLabel: "Moi-même", actionLabel: "Bio Patch" },
];

const Styles = {
  container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30",
  // Personnage 
  bgHeroContainer: "absolute inset-0 z-0 flex items-end justify-end pr-24 pb-0 pointer-events-none overflow-hidden",
  bgHeroImageBase: "max-h-[95vh] w-auto object-contain transition-all duration-1000 ease-in-out",
  bgHeroEditing: "opacity-20 translate-x-10 scale-95 blur-[2px] drop-shadow-none",
  bgHeroIdle: "opacity-70 translate-x-0 scale-100 drop-shadow-[0_0_50px_rgba(245,158,11,0.15)]",
  overlay: "absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 z-0",
  foreground: "relative z-10 flex flex-col h-full",
  workspace: "flex-1 flex gap-6 p-8 pt-0 min-h-0 overflow-hidden",
  // Gauche
  leftPanelBase: "flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out",
  leftPanelEditing: "w-[30%] min-w-[400px]",
  leftPanelIdle: "w-[45%] min-w-[500px] ml-12",
  heroBanner: "flex-none flex items-center p-5 bg-gradient-to-r from-slate-800/80 to-transparent border-b border-slate-700/50",
  heroAvatar: "w-14 h-14 rounded-lg border border-amber-500/50 bg-slate-950 flex items-center justify-center shadow-lg",
  listContainer: "flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar",
  addButtonWrapper: "flex-none p-5 border-t border-slate-800/80 bg-slate-900/50",
  addButton: "w-full py-4 border border-dashed border-slate-500 bg-slate-800/40 text-slate-300 font-bold tracking-widest rounded-xl hover:border-amber-500 hover:text-amber-400 hover:bg-slate-800 transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 uppercase",
  // Droite
  rightPanelBase: "flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-700 ease-in-out",
  rightPanelEditing: "flex-1 opacity-100 ml-0 translate-x-0",
  rightPanelIdle: "w-0 opacity-0 translate-x-20 border-none",
  wizardContainer: "min-w-[500px] h-full flex flex-col",
  wizardHeader: "px-8 py-6 border-b border-slate-700/50 bg-slate-800/30",
  stepLine: "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 -z-10",
  stepCircleBase: "w-10 h-10 rounded-full font-black flex items-center justify-center border-4 border-slate-900 transition-colors duration-500",
  stepCircleActive: "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
  stepCirclePending: "bg-slate-800 text-slate-500 font-bold",
  stepLabelBase: "text-xs font-bold uppercase tracking-widest",
  stepLabelActive: "text-amber-500",
  stepLabelPending: "text-slate-500",
  wizardBody: "flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center relative",
  wizardGlow: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none",
  wizardFooter: "p-6 border-t border-slate-700/50 bg-slate-950/50 flex justify-between items-center",
  btnCancel: "px-6 py-3 text-sm font-bold tracking-widest text-slate-400 hover:text-white transition-colors uppercase",
  btnNext: "px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-sm font-black tracking-widest rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 uppercase"
};

export function GambitEditorPage() {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  
  const currentHeroImage = heroId === "1" ? heroM : heroW;
  
  const [gambits, setGambits] = useState(INITIAL_GAMBITS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setGambits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className={Styles.container}>
      <AnimatedBackground />

      <div className={Styles.bgHeroContainer}>
        <img 
          src={currentHeroImage} 
          alt="Agent Background" 
          className={`${Styles.bgHeroImageBase} ${isEditing ? Styles.bgHeroEditing : Styles.bgHeroIdle}`} 
        />
      </div>

      <div className={Styles.overlay} />
      <div className={Styles.foreground}>
        <Header 
          title="Éditeur de Gambits" 
          subtitle="Configuration tactique" 
          onBack={() => navigate("/team")} 
        />

        <div className={Styles.workspace}>       
          <section className={`${Styles.leftPanelBase} ${isEditing ? Styles.leftPanelEditing : Styles.leftPanelIdle}`}>
            <div className={Styles.heroBanner}>
              <div className="flex items-center gap-4">
                <div className={Styles.heroAvatar}>
                  <svg className="w-6 h-6 text-amber-500/80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-widest uppercase">Agent {heroId}</h2>
                  <div className="text-xs text-amber-500 font-bold uppercase tracking-widest">{heroId === "1" ? "Guerrier" : "Archère"}</div>
                </div>
              </div>
            </div>

            <div className={Styles.listContainer}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={gambits.map(g => g.id)} strategy={verticalListSortingStrategy}>
                  {gambits.map((gambit, index) => (
                    <GambitRow key={gambit.id} gambit={gambit} index={index + 1} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div className={Styles.addButtonWrapper}>
              <button onClick={() => { setIsEditing(true); setCurrentStep(1); }} className={Styles.addButton}>
                + Ajouter une règle
              </button>
            </div>
          </section>

          <section className={`${Styles.rightPanelBase} ${isEditing ? Styles.rightPanelEditing : Styles.rightPanelIdle}`}>
            <div className={Styles.wizardContainer}>
              
              <div className={Styles.wizardHeader}>
                <div className="flex items-center justify-between relative">
                  <div className={Styles.stepLine}></div>
                  
                  {[ { num: 1, label: "Situation" }, { num: 2, label: "Conditions" }, { num: 3, label: "Action" }, { num: 4, label: "Cible" } ].map((step) => (
                    <div key={step.num} className="flex flex-col items-center gap-2 bg-slate-900 px-4">
                      <div className={`${Styles.stepCircleBase} ${currentStep >= step.num ? Styles.stepCircleActive : Styles.stepCirclePending}`}>
                        {step.num}
                      </div>
                      <span className={`${Styles.stepLabelBase} ${currentStep >= step.num ? Styles.stepLabelActive : Styles.stepLabelPending}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={Styles.wizardBody}>
                <div className={Styles.wizardGlow}></div>
                <h3 className="text-3xl font-bold text-white mb-4">Étape {currentStep}</h3>
              </div>
              <div className={Styles.wizardFooter}>
                <button onClick={() => setIsEditing(false)} className={Styles.btnCancel}>
                  Annuler
                </button>
                <button onClick={() => { if(currentStep < 4) setCurrentStep(prev => prev + 1); else setIsEditing(false); }} className={Styles.btnNext}>
                  {currentStep === 4 ? "Terminer & Sauvegarder" : "Étape suivante"}
                </button>
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
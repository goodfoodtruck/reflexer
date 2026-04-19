import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GambitRow, type UIGambit } from "./GambitRow";
import { AnimatedBackground } from "../AnimatedBackground";
import { Header } from "../header/Header";

// MOCK
const INITIAL_GAMBITS: UIGambit[] = [
  { id: "g1", conditionLabel: "Armure > 50% ET PV < 25%", targetLabel: "Moi-même", actionLabel: "Bio Patch" },
  { id: "g2", conditionLabel: "Ennemi attaque Allié", targetLabel: "Ennemi ciblé", actionLabel: "Frappe Lourde" },
];

const STYLES = {
  container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30",
  overlay: "absolute inset-0 bg-slate-950/80 z-0",
  foreground: "relative z-10 flex flex-col h-full", 
  workspace: "flex-1 flex gap-6 p-8 pt-0 min-h-0 overflow-hidden",
  leftPanel: "w-[30%] min-w-[350px] flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden",
  heroBanner: "flex items-center justify-between p-5 bg-gradient-to-r from-slate-800/80 to-transparent border-b border-slate-700/50",
  heroInfo: "flex items-center gap-4",
  heroAvatar: "w-14 h-14 rounded-lg border border-amber-500/50 bg-slate-950 flex items-center justify-center shadow-lg",
  heroName: "text-xl font-bold text-white tracking-widest uppercase",
  heroClass: "text-xs text-amber-500 font-bold uppercase tracking-widest",
  listContainer: "flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar",
  addButton: "w-full py-4 mt-2 border border-dashed border-slate-600 bg-slate-800/20 text-slate-400 font-bold tracking-widest rounded-xl hover:border-amber-500/50 hover:text-amber-400 hover:bg-slate-800/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
  rightPanel: "flex-1 flex flex-col bg-slate-900/40 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden relative",
  wizardHeader: "px-8 py-6 border-b border-slate-700/50 bg-slate-800/30",
  stepsContainer: "flex items-center justify-between relative",
  stepLine: "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 -z-10",
  stepItem: "flex flex-col items-center gap-2 bg-slate-900 px-4",
  stepCircleActive: "w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] border-4 border-slate-900",
  stepCirclePending: "w-10 h-10 rounded-full bg-slate-800 text-slate-500 font-bold flex items-center justify-center border-4 border-slate-900",
  stepLabelActive: "text-xs font-bold text-amber-500 uppercase tracking-widest",
  stepLabelPending: "text-xs font-bold text-slate-500 uppercase tracking-widest",
  wizardBody: "flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center",
  wizardFooter: "p-6 border-t border-slate-700/50 bg-slate-950/50 flex justify-between items-center",
  btnCancel: "px-6 py-3 text-sm font-bold tracking-widest text-slate-400 hover:text-white transition-colors uppercase",
  btnNext: "px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold tracking-widest rounded-lg transition-colors shadow-lg uppercase"
};

export function GambitEditorPage() {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  
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

  const handleStartCreation = () => {
    setIsEditing(true);
    setCurrentStep(1);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className={STYLES.container}>
      <AnimatedBackground />
      <div className={STYLES.overlay} />

      <div className={STYLES.foreground}>
        <Header 
          title="Éditeur de Gambits" 
          subtitle="Configuration tactique" 
          onBack={() => navigate("/team")} 
        />

        <div className={STYLES.workspace}>
          <section className={STYLES.leftPanel}>
            <div className={STYLES.heroBanner}>
              <div className={STYLES.heroInfo}>
                <div className={STYLES.heroAvatar}>
                  <svg className="w-6 h-6 text-amber-500/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div>
                  <h2 className={STYLES.heroName}>Agent {heroId}</h2>
                  <div className={STYLES.heroClass}>{heroId === "1" ? "Guerrier" : "Archère"}</div>
                </div>
              </div>
            </div>

            <div className={STYLES.listContainer} role="list">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={gambits.map(g => g.id)} strategy={verticalListSortingStrategy}>
                  {gambits.map((gambit, index) => (
                    <GambitRow key={gambit.id} gambit={gambit} index={index + 1} />
                  ))}
                </SortableContext>
              </DndContext>
              
              <button className={STYLES.addButton} onClick={handleStartCreation}>
                + AJOUTER UNE RÈGLE
              </button>
            </div>
          </section>

          <section className={STYLES.rightPanel}>
            {!isEditing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
                <svg className="w-24 h-24 mb-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <p className="mt-2 text-sm">créez-en un nouveau</p>
              </div>
            ) : (
              
              /* CRÉE UN GAMBIT */
              <>
                <div className={STYLES.wizardHeader}>
                  <div className={STYLES.stepsContainer}>
                    <div className={STYLES.stepLine}></div>
                    
                    {/* Étape 1 */}
                    <div className={STYLES.stepItem}>
                      <div className={currentStep >= 1 ? STYLES.stepCircleActive : STYLES.stepCirclePending}>1</div>
                      <span className={currentStep >= 1 ? STYLES.stepLabelActive : STYLES.stepLabelPending}>Situation</span>
                    </div>

                    {/* Étape 2 */}
                    <div className={STYLES.stepItem}>
                      <div className={currentStep >= 2 ? STYLES.stepCircleActive : STYLES.stepCirclePending}>2</div>
                      <span className={currentStep >= 2 ? STYLES.stepLabelActive : STYLES.stepLabelPending}>Conditions</span>
                    </div>

                    {/* Étape 3 */}
                    <div className={STYLES.stepItem}>
                      <div className={currentStep >= 3 ? STYLES.stepCircleActive : STYLES.stepCirclePending}>3</div>
                      <span className={currentStep >= 3 ? STYLES.stepLabelActive : STYLES.stepLabelPending}>Action</span>
                    </div>

                    {/* Étape 4 */}
                    <div className={STYLES.stepItem}>
                      <div className={currentStep >= 4 ? STYLES.stepCircleActive : STYLES.stepCirclePending}>4</div>
                      <span className={currentStep >= 4 ? STYLES.stepLabelActive : STYLES.stepLabelPending}>Cible</span>
                    </div>

                  </div>
                </div>

                {/* LES ETAPES TEXT */}
                <div className={STYLES.wizardBody}>
                  <h3 className="text-3xl font-bold text-white mb-4">Étape {currentStep}</h3>
                  <p className="text-slate-400"> etape {currentStep}  </p>
                </div>

                <div className={STYLES.wizardFooter}>
                  <button className={STYLES.btnCancel} onClick={handleCancel}>
                    Annuler
                  </button>
                  <button 
                    className={STYLES.btnNext} 
                    onClick={() => setCurrentStep(prev => Math.min(prev + 1, 4))}
                  >
                    {currentStep === 4 ? "Terminer" : "Suivant"}
                  </button>
                </div>
              </>

            )}

          </section>

        </div>
      </div>
    </div>
  );
}
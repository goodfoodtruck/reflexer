import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import heroM from "../../../assets/images/hero-m.png"; 
import heroW from "../../../assets/images/hero-w.png";
import { Header } from "../header/Header";
import bgHomeImage from "../../../assets/images/bg-home.png"; 
import { TacticalMemo } from "./TacticalMemo";
import { GambitListPanel } from "./GambitListPanel";
import type { DraftGambit, GambitCondition, GambitFilter, GambitIntent, RealGambit } from "./GambitTypes";
import { GambitEdition } from "./GambitEdition";
import { INITIAL_GAMBITS } from "./mockData";

const Styles = {
  bgContainer: "absolute inset-0 z-0",
  bgImage: "w-full h-full object-cover opacity-60",
  container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30",
  bgHeroContainer: "absolute inset-0 z-0 flex items-end justify-end pr-90 pb-0 pointer-events-none overflow-hidden",
  bgHeroImageBase: "max-h-[95vh] w-auto object-contain transition-all duration-1000 ease-in-out",
  bgHeroEditing: "opacity-20 translate-x-10 scale-95 blur-[2px] drop-shadow-none",
  bgHeroIdle: "opacity-90 translate-x-0 scale-80 drop-shadow-[0_0_50px_rgba(245,158,11,0.15)]",
  overlay: "absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 z-0",
  foreground: "relative z-10 flex flex-col h-full",
  workspace: "flex-1 flex gap-6 p-8 pt-0 min-h-0 overflow-hidden",
  rightPanelWizard: "flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-700 ease-in-out",
  rightPanelMemo: "w-[350px] ml-auto flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-8 transition-all duration-700 ease-in-out",
};

export function GambitEditorPage() {
  const { heroId } = useParams<{ heroId: string }>();
  const navigate = useNavigate();
  const currentHeroImage = heroId === "1" ? heroM : heroW; 
  
  const [gambits, setGambits] = useState<RealGambit[]>(INITIAL_GAMBITS);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGambitId, setEditingGambitId] = useState<string | null>(null);

  const gambitToEdit = editingGambitId ? gambits.find(g => g.id === editingGambitId) : undefined;

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
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((g, index) => ({ ...g, priority: index + 1 }));
      });
    }
  };

  const handleDeleteGambit = (id: string) => {
    setGambits((prev) => {
      const remaining = prev.filter(g => g.id !== id);
      return remaining.map((g, index) => ({ ...g, priority: index + 1 }));
    });
    if (editingGambitId === id) {
      setIsEditing(false);
      setEditingGambitId(null);
    }
  };

  const handleEditClick = (id: string) => {
    setEditingGambitId(id);
    setIsEditing(true);
  };

  const handleSaveGambit = (draft: DraftGambit) => {
    const backendConditionsArr: GambitCondition[] = draft.conditions.map(c => {
      const filter: GambitFilter = { type: c.filterType as string };

      if (c.filterType === "HP_BELOW" || (c.filterType as string) === "HP_ABOVE") {
        filter.threshold = Number(c.value);
      } else if (c.filterType === "IN_RANGE") {
        filter.range = Number(c.value);
      } else {
        filter.status = String(c.value); 
      }

      return {
        type: "EXISTS" as const,
        scope: { kind: c.scopeKind, filter: filter }
      };
    });

    let finalConditions: GambitCondition;
    if (backendConditionsArr.length === 1) {
      finalConditions = backendConditionsArr[0];
    } else {
      finalConditions = { operator: draft.operator, conditions: backendConditionsArr };
    }

    const backendIntent: GambitIntent = draft.intentKind === "MOVEMENT" 
      ? { kind: "MOVEMENT", strategy: draft.intentValue }
      : { kind: "ACTION", action: { id: draft.intentValue, type: "skill", processorConfigs: [] } };

    const newRealGambit: RealGambit = {
      id: editingGambitId ? editingGambitId : `${draft.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      priority: editingGambitId 
        ? (gambits.find(g => g.id === editingGambitId)?.priority || gambits.length + 1)
        : gambits.length + 1,
      conditions: finalConditions,
      targetSelector: { 
        context: { kind: draft.targetKind, filters: [] }, 
        sort: draft.targetSort 
      },
      intent: backendIntent
    };

    if (editingGambitId) {
      setGambits(prev => prev.map(g => g.id === editingGambitId ? newRealGambit : g));
    } else {
      setGambits(prev => [...prev, newRealGambit]);
    }
    
    setIsEditing(false);
    setEditingGambitId(null);
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.bgContainer}><img src={bgHomeImage} alt="Reflexer Background" className={Styles.bgImage}/></div>
      <div className={Styles.bgHeroContainer}><img src={currentHeroImage} alt="Agent Background" className={`${Styles.bgHeroImageBase} ${isEditing ? Styles.bgHeroEditing : Styles.bgHeroIdle}`} /></div>
      <div className={Styles.overlay} />

      <div className={Styles.foreground}>
        <Header title="Éditeur de Gambits" subtitle="Configuration tactique" onBack={() => navigate("/team")} />

        <div className={Styles.workspace}>       
          <GambitListPanel 
            heroId={heroId}
            gambits={gambits}
            isEditing={isEditing}
            onAddClick={() => { setEditingGambitId(null); setIsEditing(true); }}
            onEdit={handleEditClick}
            onDelete={handleDeleteGambit}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          />

          {isEditing ? (
            <section className={Styles.rightPanelWizard}>
              <GambitEdition 
                initialGambit={gambitToEdit}
                onCancel={() => { setIsEditing(false); setEditingGambitId(null); }} 
                onSave={handleSaveGambit} 
              />
            </section>
          ) : (
            <section className={Styles.rightPanelMemo}>
              <TacticalMemo />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
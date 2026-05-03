import { DndContext, closestCenter, type DragEndEvent, type SensorDescriptor, type SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GambitRow } from './GambitRow';
import type { RealGambit } from './GambitEditorPage'; 

interface GambitListPanelProps {
  heroId?: string;
  gambits: RealGambit[];
  isEditing: boolean;
  onAddClick: () => void;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
}

const PanelStyles = {
  base: "flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ease-in-out relative",
  editing: "w-[30%] min-w-[400px]",
  idle: "w-[45%] min-w-[500px] ml-12",
  heroBanner: "flex-none flex items-center p-6 bg-gradient-to-r from-slate-900/80 to-transparent border-b border-slate-700/50 relative overflow-hidden",
  heroBannerGlow: "absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none",
  heroHeaderContent: "flex items-center gap-4 relative z-10",
  heroAvatar: "w-14 h-14 rounded-lg border border-amber-500/50 bg-slate-950/80 flex items-center justify-center text-amber-500 shadow-lg relative z-10",
  heroAvatarIcon: "w-7 h-7 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  heroTitle: "text-xl font-black text-white tracking-widest uppercase drop-shadow-md",
  heroSubtitle: "text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2",
  heroPulseDot: "w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse",
  listContainer: "flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar",
  addButtonWrapper: "flex-none px-4 py-2 border-t border-slate-700/50 bg-transparent",
  addButton: "w-full py-3 bg-transparent text-slate-500 font-bold tracking-[0.2em] text-[10px] hover:text-amber-500 transition-colors focus-visible:outline-none uppercase flex justify-center items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed",
  addButtonIcon: "w-4 h-4",
};

export function GambitListPanel({ heroId, gambits, isEditing, onAddClick, sensors, onDragEnd }: GambitListPanelProps) {
  return (
    <section className={`${PanelStyles.base} ${isEditing ? PanelStyles.editing : PanelStyles.idle}`}>
      <div className={PanelStyles.heroBanner}>
        <div className={PanelStyles.heroBannerGlow} />
        <div className={PanelStyles.heroHeaderContent}>
          <div className={PanelStyles.heroAvatar}>
            <svg className={PanelStyles.heroAvatarIcon} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div>
            <h2 className={PanelStyles.heroTitle}>Agent {heroId || "1"}</h2>
            <div className={PanelStyles.heroSubtitle}>
                <span className={PanelStyles.heroPulseDot}></span>
                Priorités Tactiques
            </div>
          </div>
        </div>
      </div>

      <div className={PanelStyles.listContainer}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={gambits.map(g => g.id)} strategy={verticalListSortingStrategy}>
            {gambits.map((gambit) => (
              <GambitRow key={gambit.id} gambit={gambit} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className={PanelStyles.addButtonWrapper}>
        <button onClick={onAddClick} className={PanelStyles.addButton} disabled={isEditing}>
          <svg className={PanelStyles.addButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Ajouter une règle
        </button>
      </div>
    </section>
  );
}
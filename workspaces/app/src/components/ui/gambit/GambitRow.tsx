import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import type { RealGambit, GambitCondition, GambitFilter } from "./GambitTypes";
import { DragIcon } from "../../../assets/icons/IconDrag";
import { ChevronIcon } from "../../../assets/icons/IconChevron";
import { ArrowRightIcon } from "../../../assets/icons/IconArrowRight";
import { IconEdit } from "../../../assets/icons/IconEdit";
import { IconTrash } from "../../../assets/icons/IconTrash";

const Styles = {
  containerBase: "group relative flex flex-col rounded-xl border transition-all duration-200",
  containerDragging: "bg-[#11131A] border-amber-500 shadow-xl scale-[1.02] z-50",
  containerOpen: "bg-[#11131A] border-[#2A2E39] shadow-lg",
  containerClosed: "bg-[#11131A] border-transparent hover:border-[#2A2E39]",
  headerArea: "flex items-center gap-4 p-4 relative z-10",
  dragHandle: "text-slate-600 hover:text-amber-500 cursor-grab active:cursor-grabbing focus-visible:outline-none",
  priorityBadge: "w-7 h-7 rounded bg-[#0A0C10] border border-[#2A2E39] flex-none flex items-center justify-center text-amber-500 font-black text-xs",
  
  // MODIFICATION ICI: toggleArea remplace toggleButton pour éviter les conflits HTML
  toggleArea: "flex-1 flex items-center justify-between focus-visible:outline-none text-left cursor-pointer",
  titleText: "text-slate-200 font-bold tracking-widest uppercase text-sm group-hover:text-white transition-colors",
  
  // NOUVEAUX STYLES POUR LES ACTIONS
  actionsWrapper: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
  actionBtnEdit: "p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors",
  actionBtnDelete: "p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors",
  
  chevronIconBase: "w-5 h-5 text-slate-600 transition-transform duration-300 group-hover:text-amber-500",
  chevronIconOpen: "rotate-180 text-amber-500",
  detailsPanel: "mx-4 mb-4 mt-1 bg-[#0A0C10] rounded-lg border border-[#1A1D24] p-5",
  detailsGrid: "grid grid-cols-[60px_1fr] gap-y-6 items-start",
  sectionLabel: "text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2",
  logicConnectorArea: "flex items-center gap-2 ml-4",
  logicConnectorLine: "w-px h-3 bg-slate-700",
  logicConnectorText: "text-[10px] font-black text-amber-500/80 tracking-widest uppercase",
  conditionBox: "flex items-center gap-3 bg-[#1A1D24] border border-[#2A2E39] rounded-md py-1.5 px-2 w-fit",
  conditionBadgeBase: "text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm",
  conditionSelf: "bg-blue-500/15 text-blue-400",
  conditionEnemy: "bg-red-500/15 text-red-400",
  conditionAlly: "bg-emerald-500/15 text-emerald-400",
  filterText: "text-xs font-bold text-slate-200 pr-2",
  notContainer: "flex flex-col gap-2",
  notBox: "flex items-center gap-2 bg-[#1A1D24] border border-red-500/20 rounded-md py-1 px-1.5 w-fit",
  notBadge: "text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-red-500/10 text-red-500",
  targetFlex: "flex items-center gap-3",
  targetBox: "flex items-center gap-2 bg-[#1A1D24] border border-[#2A2E39] rounded-md py-1.5 px-2",
  targetKindBadge: "text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-sm bg-slate-800 text-slate-300",
  targetFilterText: "text-xs font-medium text-slate-400 pr-1",
  targetArrow: "w-4 h-4 text-slate-600",
  targetSortBadge: "text-xs font-black tracking-widest text-amber-500 uppercase bg-amber-500/10 px-3 py-1.5 rounded-md border border-amber-500/20",
  intentBadgeBase: "text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-md border inline-block",
  intentMovement: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  intentAction: "bg-amber-500/10 text-amber-400 border-amber-500/20"
};

interface GambitRowProps {
  gambit: RealGambit;
  onEdit: () => void;
  onDelete: () => void;
}

export function GambitRow({ gambit, onEdit, onDelete }: GambitRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: gambit.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const renderFilterText = (filter?: GambitFilter) => {
    if (!filter) return null;
    switch (filter.type) {
      case "HP_BELOW": return `PV < ${filter.threshold}%`;
      case "HP_ABOVE": return `PV > ${filter.threshold}%`;
      case "IN_RANGE": return `À portée ${filter.range}`;
      case "HAS_STATUS": return `Statut : ${filter.status}`;
      case "IS_TRAP": return `Est un piège`;
      case "IS_ATTACKING_ALLY": return `Attaque un allié`;
      default: return filter.type;
    }
  };

  const renderConditionNode = (node: GambitCondition, index: number = 0, parentOp?: string): React.ReactNode => {
    if ("type" in node && node.type === "EXISTS") {
      const kind = node.scope.kind;
      const filterStr = renderFilterText(node.scope.filter);
      
      const badgeColor = 
        kind === "SELF" ? Styles.conditionSelf : 
        kind === "ENEMY" ? Styles.conditionEnemy : 
        Styles.conditionAlly;

      return (
        <div key={`${node.type}-${index}`} className="flex flex-col gap-2">
          {parentOp && index > 0 && (
            <div className={Styles.logicConnectorArea}>
              <div className={Styles.logicConnectorLine}></div>
              <span className={Styles.logicConnectorText}>
                {parentOp === "AND" ? "ET" : "OU"}
              </span>
            </div>
          )}
          <div className={Styles.conditionBox}>
            <span className={`${Styles.conditionBadgeBase} ${badgeColor}`}>
              {kind}
            </span>
            {filterStr && <span className={Styles.filterText}>{filterStr}</span>}
          </div>
        </div>
      );
    }

    if ("operator" in node && (node.operator === "AND" || node.operator === "OR")) {
      return (
        <div key={`group-${index}`} className="flex flex-col">
          {node.conditions.map((child, i) => renderConditionNode(child, i, node.operator))}
        </div>
      );
    }

    if ("operator" in node && node.operator === "NOT") {
      return (
        <div key={`not-${index}`} className={Styles.notContainer}>
          {parentOp && index > 0 && (
            <div className={Styles.logicConnectorArea}>
              <div className={Styles.logicConnectorLine}></div>
              <span className={Styles.logicConnectorText}>
                {parentOp === "AND" ? "ET" : "OU"}
              </span>
            </div>
          )}
          <div className={Styles.notBox}>
            <span className={Styles.notBadge}>NON</span>
            <div className="pr-1">
              {renderConditionNode(node.condition, 0)}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const dynamicContainerStyle = isDragging ? Styles.containerDragging : isOpen ? Styles.containerOpen : Styles.containerClosed;
  const dynamicChevronStyle = isOpen ? Styles.chevronIconOpen : "";
  const dynamicIntentStyle = gambit.intent.kind === "MOVEMENT" ? Styles.intentMovement : Styles.intentAction;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${Styles.containerBase} ${dynamicContainerStyle}`}
    >
      <div className={Styles.headerArea}>
        <button {...attributes} {...listeners} className={Styles.dragHandle}>
          <DragIcon className="w-5 h-5" />
        </button>
        
        <div className={Styles.priorityBadge}>
          {gambit.priority.toString().padStart(2, '0')}
        </div>
        
        <div className={Styles.toggleArea} onClick={() => setIsOpen(!isOpen)}>
          <span className={Styles.titleText}>
            {gambit.id.replace(/-/g, ' ')}
          </span>
          
          <div className="flex items-center gap-4">
            <div className={Styles.actionsWrapper}>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                className={Styles.actionBtnEdit}
                title="Modifier cette règle"
              >
                <IconEdit />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                className={Styles.actionBtnDelete}
                title="Supprimer cette règle"
              >
                <IconTrash />
              </button>
            </div>
            
            <ChevronIcon className={`${Styles.chevronIconBase} ${dynamicChevronStyle}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.2 }} 
            className="overflow-hidden"
          >
            <div className={Styles.detailsPanel}>
              <div className={Styles.detailsGrid}>
                
                <div className={Styles.sectionLabel}>Quand</div>
                <div className="flex flex-col">
                  {renderConditionNode(gambit.conditions)}
                </div>

                <div className={Styles.sectionLabel}>Cibler</div>
                <div className={Styles.targetFlex}>
                  <div className={Styles.targetBox}>
                    <span className={Styles.targetKindBadge}>
                      {gambit.targetSelector.context.kind}
                    </span>
                    {gambit.targetSelector.context.filters?.map((f, i) => (
                      <span key={i} className={Styles.targetFilterText}>
                        ({renderFilterText(f)})
                      </span>
                    ))}
                  </div>
                  
                  <ArrowRightIcon className={Styles.targetArrow} />
                  
                  <span className={Styles.targetSortBadge}>
                    {gambit.targetSelector.sort.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className={Styles.sectionLabel}>Faire</div>
                <div>
                  <span className={`${Styles.intentBadgeBase} ${dynamicIntentStyle}`}>
                    {gambit.intent.kind === "MOVEMENT" ? `DÉPLACEMENT : ${gambit.intent.strategy}` : `ACTION : ${gambit.intent.action.id}`}
                  </span>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
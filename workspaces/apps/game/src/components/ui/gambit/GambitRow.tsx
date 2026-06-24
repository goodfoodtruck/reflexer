import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { DragIcon } from '@assets/icons/IconDrag';
import { ChevronIcon } from '@assets/icons/IconChevron';
import { ArrowRightIcon } from '@assets/icons/IconArrowRight';
import { IconEdit } from '@assets/icons/IconEdit';
import { IconTrash } from '@assets/icons/IconTrash';
import { Styles_gambit_row } from './Gambit.styles';
import type { StoredGambit } from '@services/gambit.service';
import { renderConditionNode } from './ConditionTreeView';
import { sortToLabel, targetSelectorToConditionGroup } from './gambit.adapter';
import { ACTION_CATEGORIES } from './actionCatalog';

const STRATEGY_LABELS: Record<string, string> = {
  APPROACH: 'Chargez !',
  FLEE: 'Fuite',
  STAY: 'Tenir la position',
};

function resolveIntentLabel(intent: StoredGambit['intent']): string {
  if (intent.kind === 'MOVEMENT') {
    const label = STRATEGY_LABELS[intent.strategy] ?? intent.strategy;
    return `DÉPLACEMENT : ${label}`;
  }
  for (const cat of ACTION_CATEGORIES) {
    const found = cat.items.find((item) => item.id === intent.actionId);
    if (found) return `ACTION : ${found.name}`;
  }
  return `ACTION : ${intent.actionId}`;
}

interface GambitRowProps {
  gambit: StoredGambit;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GambitRow({ gambit, isOpen, onToggle, onEdit, onDelete }: GambitRowProps) {

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gambit._id
  });

  const containerStyle = isDragging
    ? Styles_gambit_row.containerDragging
    : isOpen
      ? Styles_gambit_row.containerOpen
      : Styles_gambit_row.containerClosed;

  const intentStyle =
    gambit.intent.kind === 'MOVEMENT'
      ? Styles_gambit_row.intentMovement
      : Styles_gambit_row.intentAction;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${Styles_gambit_row.containerBase} ${containerStyle}`}
    >
      <div className={Styles_gambit_row.headerArea}>
        <button {...attributes} {...listeners} className={Styles_gambit_row.dragHandle}>
          <DragIcon className="w-5 h-5" />
        </button>

        <div className={Styles_gambit_row.priorityBadge}>
          {gambit.priority.toString().padStart(2, '0')}
        </div>

        <div className={Styles_gambit_row.toggleArea} onClick={onToggle}>
          <span className={Styles_gambit_row.titleText}>{gambit.name}</span>

          <div className="flex items-center gap-4">
            <div className={Styles_gambit_row.actionsWrapper}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className={Styles_gambit_row.actionBtnEdit}
                title="Modifier cette règle"
              >
                <IconEdit />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className={Styles_gambit_row.actionBtnDelete}
                title="Supprimer cette règle"
              >
                <IconTrash />
              </button>
            </div>
            <ChevronIcon
              className={`${Styles_gambit_row.chevronIconBase} ${isOpen ? Styles_gambit_row.chevronIconOpen : ''}`}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={Styles_gambit_row.detailsPanel}>
              <div className={Styles_gambit_row.detailsGrid}>
                <div className={Styles_gambit_row.sectionLabel}>Quand</div>
                <div className="flex flex-col min-w-0">{renderConditionNode(gambit.conditions)}</div>

                <div className={Styles_gambit_row.sectionLabel}>Cibler</div>
                <div className={Styles_gambit_row.targetSection}>
                  <div className="flex flex-col min-w-0">
                    {renderConditionNode(targetSelectorToConditionGroup(gambit.targetSelector))}
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRightIcon className={Styles_gambit_row.targetArrow} />
                    <span className={Styles_gambit_row.targetSortBadge}>
                      {sortToLabel(gambit.targetSelector.sort)}
                    </span>
                  </div>
                </div>

                <div className={Styles_gambit_row.sectionLabel}>Faire</div>
                <div>
                  <span className={`${Styles_gambit_row.intentBadgeBase} ${intentStyle}`}>
                    {resolveIntentLabel(gambit.intent)}
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

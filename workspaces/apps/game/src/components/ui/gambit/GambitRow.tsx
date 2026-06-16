import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { DragIcon } from '../../../assets/icons/IconDrag';
import { ChevronIcon } from '../../../assets/icons/IconChevron';
import { ArrowRightIcon } from '../../../assets/icons/IconArrowRight';
import { IconEdit } from '../../../assets/icons/IconEdit';
import { IconTrash } from '../../../assets/icons/IconTrash';
import { Styles_gambit_row } from './Gambit.styles';
import { renderConditionNode, renderFilterText } from './gambit.utils';
import type { Gambit } from '@reflexer/engine';

interface GambitRowProps {
  gambit: Gambit;
  onEdit: () => void;
  onDelete: () => void;
}

export function GambitRow({ gambit, onEdit, onDelete }: GambitRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gambit.id
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

        <div className={Styles_gambit_row.toggleArea} onClick={() => setIsOpen(!isOpen)}>
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
                <div className="flex flex-col">{renderConditionNode(gambit.conditions)}</div>

                <div className={Styles_gambit_row.sectionLabel}>Cibler</div>
                <div className={Styles_gambit_row.targetFlex}>
                  <div className={Styles_gambit_row.targetBox}>
                    <span className={Styles_gambit_row.targetKindBadge}>
                      {gambit.targetSelector.context.targetType}
                    </span>
                    {'filters' in gambit.targetSelector.context &&
                      gambit.targetSelector.context.filters.map((f, i) => (
                        <span key={i} className={Styles_gambit_row.targetFilterText}>
                          ({renderFilterText(f)})
                        </span>
                      ))}
                  </div>
                  <ArrowRightIcon className={Styles_gambit_row.targetArrow} />
                  <span className={Styles_gambit_row.targetSortBadge}>
                    {gambit.targetSelector.sort.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className={Styles_gambit_row.sectionLabel}>Faire</div>
                <div>
                  <span className={`${Styles_gambit_row.intentBadgeBase} ${intentStyle}`}>
                    {gambit.intent.kind === 'MOVEMENT'
                      ? `DÉPLACEMENT : ${gambit.intent.strategy}`
                      : `ACTION : ${gambit.intent.actionId}`}
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

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
  type Modifier,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GambitRow } from './GambitRow';
import { AvatarIcon } from '@assets/icons/IconAvatar';
import { AddIcon } from '@assets/icons/IconAdd';
import { PanelStyles } from './Gambit.styles';
import type { StoredGambit } from '@services/gambit.service';

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

interface GambitListPanelProps {
  caracterName?: string;
  gambits: StoredGambit[];
  isEditing: boolean;
  onAddClick: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
}

export function GambitListPanel({
  caracterName,
  gambits,
  isEditing,
  onAddClick,
  onEdit,
  onDelete,
  sensors,
  onDragEnd,
}: GambitListPanelProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      data-guide="gambit-list"
      className={`${PanelStyles.base} ${isEditing ? PanelStyles.editing : PanelStyles.idle}`}
    >
      <div className={PanelStyles.heroBanner}>
        <div className={PanelStyles.heroBannerGlow} />
        <div className={PanelStyles.heroHeaderContent}>
          <div className={PanelStyles.heroAvatar}>
            <AvatarIcon className={PanelStyles.heroAvatarIcon} />
          </div>
          <div>
            <h2 className={PanelStyles.heroTitle}>Agent {caracterName || '1'}</h2>
            <div className={PanelStyles.heroSubtitle}>
              <span className={PanelStyles.heroPulseDot} />
              Priorités Tactiques
            </div>
          </div>
        </div>
      </div>

      <div className={PanelStyles.listContainer}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={gambits.map((g) => g._id)} strategy={verticalListSortingStrategy}>
            {gambits.map((gambit) => (
              <GambitRow
                key={gambit._id}
                gambit={gambit}
                isOpen={openId === gambit._id}
                onToggle={() => handleToggle(gambit._id)}
                onEdit={() => onEdit(gambit._id)}
                onDelete={() => onDelete(gambit._id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className={PanelStyles.addButtonWrapper}>
        <button
          data-guide="ajouter-gambit"
          onClick={onAddClick}
          className={PanelStyles.addButton}
          disabled={isEditing}
        >
          <AddIcon className={PanelStyles.addButtonIcon} />
          Ajouter une règle
        </button>
      </div>
    </section>
  );
}

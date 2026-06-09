import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GambitRow } from './GambitRow';
import type { RealGambit } from './GambitTypes';
import { AvatarIcon } from '../../../assets/icons/IconAvatar';
import { AddIcon } from '../../../assets/icons/IconAdd';
import { PanelStyles } from './Gambit.styles';

interface GambitListPanelProps {
  caracterName?: string;
  gambits: RealGambit[];
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
  onDragEnd
}: GambitListPanelProps) {
  return (
    <section
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={gambits.map((g) => g.id)} strategy={verticalListSortingStrategy}>
            {gambits.map((gambit) => (
              <GambitRow
                key={gambit.id}
                gambit={gambit}
                onEdit={() => onEdit(gambit.id)}
                onDelete={() => onDelete(gambit.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className={PanelStyles.addButtonWrapper}>
        <button onClick={onAddClick} className={PanelStyles.addButton} disabled={isEditing}>
          <AddIcon className={PanelStyles.addButtonIcon} />
          Ajouter une règle
        </button>
      </div>
    </section>
  );
}

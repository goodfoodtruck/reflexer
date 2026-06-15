import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { GambitService } from '../../../services';
import type { DraftGambit } from './GambitTypes';
import { draftToConditions, draftToIntent, draftToTargetSelector } from './gambit.adapter';
import { CharacterService, type Character } from '@services/character.service';
import type { Gambit } from '@reflexer/engine';

export function useGambitEditor(userId: string) {

  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<Character | null>(null);
  const [gambits, setGambits] = useState<Gambit[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGambitId, setEditingGambitId] = useState<string | null>(null);

  const gambitToEdit = editingGambitId ? gambits.find((g) => g.id === editingGambitId) : undefined;

  useEffect(() => {
    if (! characterId) return;

    CharacterService.getById(characterId)
      .then(setCharacter)
      .catch((err) => console.error('Erreur chargement character:', err));

        GambitService.getUserGambitsByCharacter(userId)
        .then((gambitsByCharacter) => {                        
            const characterData = gambitsByCharacter.find(c => c.characterId === characterId)
            setGambits(characterData?.gambits ?? [])
        })
        .catch((err) => console.error("Erreur chargement gambits:", err))
  }, [characterId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGambits((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((g, index) => ({
        ...g,
        priority: index + 1
      }));
      reordered.forEach((g) =>
        GambitService.update(g.id, { priority: g.priority }).catch(console.error)
      );
      return reordered;
    });
  };

  const handleDeleteGambit = async (id: string) => {
    try {
      await GambitService.delete(id);
      setGambits((prev) =>
        prev.filter((g) => g.id !== id).map((g, index) => ({ ...g, priority: index + 1 }))
      );
      if (editingGambitId === id) {
        setIsEditing(false);
        setEditingGambitId(null);
      }
    } catch (err) {
      console.error('Erreur suppression gambit:', err);
    }
  };

  const handleEditClick = (id: string) => {
    setEditingGambitId(id);
    setIsEditing(true);
  };

  const handleAddClick = () => {
    setEditingGambitId(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingGambitId(null);
  };

  const handleSaveGambit = async (draft: DraftGambit) => {
    if (!characterId) return;

    const finalConditions = draftToConditions(draft);
    const targetSelector = draftToTargetSelector(draft);
    const intent = draftToIntent(draft);

    try {
      if (editingGambitId) {
        const updated = await GambitService.update(editingGambitId, {
          name: draft.name,
          conditions: finalConditions,
          targetSelector,
          intent
        });
        setGambits((prev) =>
          prev.map((g) =>
            g.id === editingGambitId
              ? {
                  id: updated._id,
                  name: updated.name,
                  priority: updated.priority,
                  conditions: updated.conditions,
                  targetSelector: updated.targetSelector,
                  intent: updated.intent
                }
              : g
          )
        );
      } else {
        const created = await GambitService.add(userId, draft.name, characterId, {
          priority: gambits.length + 1,
          conditions: finalConditions,
          targetSelector,
          intent
        });
        setGambits((prev) => [
          ...prev,
          {
            id: created._id,
            name: created.name,
            priority: created.priority,
            conditions: created.conditions,
            targetSelector: created.targetSelector,
            intent: created.intent
          }
        ]);
      }
      handleCancelEdit();
    } catch (err) {
      console.error('Erreur sauvegarde gambit:', err);
    }
  }

  return {
    characterId,
    navigate,
    character,
    gambits,
    isEditing,
    gambitToEdit,
    sensors,
    handleDragEnd,
    handleDeleteGambit,
    handleEditClick,
    handleAddClick,
    handleCancelEdit,
    handleSaveGambit
  };
}

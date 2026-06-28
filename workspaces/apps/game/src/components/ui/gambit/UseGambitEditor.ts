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
import { GambitService, type StoredGambit } from '@services/gambit.service';
import type { DraftGambit } from './GambitTypes';
import { draftToConditions, draftToIntent, draftToTargetSelector } from './gambit.adapter';
import { CharacterService, type Character } from '@services/character.service';

export function useGambitEditor(userId: string) {

  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<Character | null>(null);
  const [gambits, setGambits] = useState<StoredGambit[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGambitId, setEditingGambitId] = useState<string | null>(null);

  const gambitToEdit = editingGambitId ? gambits.find((g) => g._id === editingGambitId) : undefined;
  
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
  }, [characterId, userId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGambits((items) => {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((g, index) => ({
        ...g,
        priority: index + 1
      }));
      reordered.forEach((g) =>
        GambitService.update(g._id, { priority: g.priority }).catch(console.error)
      );
      return reordered;
    });
  };

  const handleDeleteGambit = async (id: string) => {
    try {
      await GambitService.delete(id);
      setGambits((prev) =>
        prev.filter((g) => g._id !== id).map((g, index) => ({ ...g, priority: index + 1 }))
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
        await GambitService.update(editingGambitId, {
          name: draft.name,
          conditions: finalConditions,
          targetSelector,
          intent
        });
        setGambits((prev) =>
          prev.map((g) =>
            g._id === editingGambitId
              ? { ...g, name: draft.name, conditions: finalConditions, targetSelector, intent }
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
            _id: created._id,
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

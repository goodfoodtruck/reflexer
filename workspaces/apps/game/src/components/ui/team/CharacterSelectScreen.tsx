import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@components/ui/header/Header';
import bgHomeImage from '@assets/images/bg-home.png';
import { AnimatedBackground } from '@components/ui/AnimatedBackground';
import { CharacterService, type Character } from '@services/character.service';
import { resolveCharacterImages } from '@components/ui/images/characterImages';
import { CharacterGrid } from './CharacterGrid';
import { CharacterPanel } from './CharacterPanel';
import type { SelectedCharacter } from './type';
import {
  SELECT_SCREEN_STYLES as STYLES,
  SELECT_SCREEN_KEYFRAMES as KEYFRAMES
} from './Team.styles';

interface Props {
  onConfirm: (team: [SelectedCharacter, SelectedCharacter]) => void;
  onBack?: () => void;
  initialSelection?: [SelectedCharacter, SelectedCharacter] | null;
}

export function CharacterSelectScreen({ onConfirm, onBack, initialSelection }: Props) {
  const [roster, setRoster] = useState<SelectedCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<(SelectedCharacter | null)[]>(
    initialSelection ?? [null, null]
  );
  const [hovered, setHovered] = useState<SelectedCharacter | null>(null);

  useEffect(() => {
    CharacterService.getAll()
      .then((characters: Character[]) => {
        setRoster(
          characters.map((char) => ({
            id: char._id,
            slug: char.slug,
            name: char.characterName,
            description: char.description,
            baseStats: char.baseStats as { health: number; energy: number; armor: number },
            ...resolveCharacterImages(char.slug)
          }))
        );
      })
      .catch(() => setLoadError('Impossible de charger le catalogue'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (character: SelectedCharacter) => {
    const current = [...selected];
    const existingIdx = current.findIndex((s) => s?.id === character.id);
    if (existingIdx !== -1) {
      current[existingIdx] = null;
    } else {
      const empty = current.findIndex((s) => s === null);
      if (empty !== -1) current[empty] = character;
    }
    setSelected(current);
  };

  const canConfirm = selected[0] !== null && selected[1] !== null;
  // L'aperçu au survol-> joueur 1  puis joueur 2
  const nextEmptySlot = selected.findIndex((s) => s === null);
  const previewForSlot = (slotIndex: number) => (nextEmptySlot === slotIndex ? hovered : null);

  const statusLabel =
    selected[0] === null
      ? 'Sélectionnez le personnage 1'
      : selected[1] === null
        ? 'Sélectionnez le personnage 2'
        : 'Équipe prête — confirmez !';

  return (
    <div className={STYLES.page}>
      <style>{KEYFRAMES}</style>

      <div className={STYLES.bgWrapper}>
        <img src={bgHomeImage} alt="" className={STYLES.bgImage} />
      </div>
      <AnimatedBackground />
      <div className={STYLES.bgOverlay} />

      <div className={STYLES.foreground}>
        <Header title="Sélection de l'équipe" subtitle="Équipe" onBack={onBack} />

        <div className={STYLES.statusBar}>
          <p className={STYLES.statusText}>
            {loading ? 'Chargement…' : (loadError ?? statusLabel)}
          </p>
        </div>

        <div className={STYLES.layout}>
          {/* Panneau gauche */}
          <CharacterPanel
            character={selected[0]}
            color="amber"
            label="JOUEUR 1"
            slot={1}
            align="left"
            preview={previewForSlot(0)}
          />

          {/* Les portraits */}
          <div className={STYLES.gridColumn}>
            <CharacterGrid
              roster={roster}
              selected={selected}
              canConfirm={canConfirm}
              onSelect={handleSelect}
              onHover={setHovered}
            />

            {/* Bouton confirmer */}
            <div className={STYLES.confirmRow}>
              <motion.button
                onClick={() =>
                  canConfirm && onConfirm(selected as [SelectedCharacter, SelectedCharacter])
                }
                disabled={!canConfirm}
                className={`${STYLES.confirmButtonBase} ${
                  canConfirm ? STYLES.confirmButtonActive : STYLES.confirmButtonDisabled
                }`}
                whileHover={canConfirm ? { scale: 1.02 } : {}}
                whileTap={canConfirm ? { scale: 0.97 } : {}}
              >
                {canConfirm ? 'Confirmer →' : '2 personnages'}
              </motion.button>
            </div>
          </div>

          {/* Panneau droit */}
          <CharacterPanel
            character={selected[1]}
            color="sky"
            label="JOUEUR 2"
            slot={2}
            align="right"
            preview={previewForSlot(1)}
          />
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import type { SelectedCharacter } from './type';
import { GRID_ITEM_STYLES as STYLES, GRID_ITEM_COLOR_VARIANTS } from './Team.styles';

interface CharacterGridItemProps {
  character: SelectedCharacter;
  /** -1 si non sélectionné, 0 (joueur 1) ou 1 (joueur 2) sinon. */
  slot: number;
  dimmed: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function CharacterGridItem({
  character,
  slot,
  dimmed,
  onClick,
  onMouseEnter,
  onMouseLeave
}: CharacterGridItemProps) {
  const isSelected = slot !== -1;
  const variant = isSelected ? GRID_ITEM_COLOR_VARIANTS[slot === 0 ? 'amber' : 'sky'] : null;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={STYLES.tile}
      style={{ aspectRatio: '1/1' }}
      whileHover={{ scale: 1.07, zIndex: 10 }}
      whileTap={{ scale: 0.93 }}
      animate={{ opacity: dimmed ? 0.28 : 1 }}
      transition={{ duration: 0.15 }}
    >
      {character.portrait ? (
        <img src={character.portrait} alt={character.name} className={STYLES.portraitImage} />
      ) : (
        <div className={STYLES.placeholderWrapper}>
          <span className={STYLES.placeholderText}>{character.name[0]}</span>
        </div>
      )}

      <div className={STYLES.hoverOverlay} />

      <div
        className={`${STYLES.borderBase} ${variant ? variant.border : STYLES.borderUnselected}`}
      />

      {variant && <div className={`${STYLES.glowBase} ${variant.glow}`} />}

      {variant && <div className={`${STYLES.badgeBase} ${variant.badge}`}>{slot + 1}</div>}

      <div className={STYLES.nameBarWrapper}>
        <p className={STYLES.nameBarText}>{character.name}</p>
      </div>
    </motion.button>
  );
}

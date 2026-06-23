import { CharacterGridItem } from './CharacterGridItem';
import type { SelectedCharacter } from './type';
import { GRID_STYLES as STYLES } from './Team.styles';

interface CharacterGridProps {
  roster: SelectedCharacter[];
  selected: (SelectedCharacter | null)[];
  canConfirm: boolean;
  onSelect: (character: SelectedCharacter) => void;
  onHover: (character: SelectedCharacter | null) => void;
}

export function CharacterGrid({
  roster,
  selected,
  canConfirm,
  onSelect,
  onHover
}: CharacterGridProps) {
  const getSlot = (id: string) => selected.findIndex((s) => s?.id === id);

  return (
    <div className={STYLES.scrollWrapper}>
      <div className={STYLES.gridLayout}>
        {roster.map((character) => {
          const slot = getSlot(character.id);

          return (
            <CharacterGridItem
              key={character.id}
              character={character}
              slot={slot}
              dimmed={canConfirm && slot === -1}
              onClick={() => onSelect(character)}
              onMouseEnter={() => onHover(character)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })}
      </div>
    </div>
  );
}

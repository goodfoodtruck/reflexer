import { Styles } from '../Condition.styles';

interface CriteriaListPaneProps {
  items: readonly { id: string; label: string }[] | readonly string[];
  selectedIds: string[];
  /** Items affichés en bleu/teal — indique la sélection active en cours d'édition. */
  focusedIds?: string[];
  onSelect: (id: string) => void;
}

function getId(item: { id: string; label: string } | string): string {
  return typeof item === 'string' ? item : item.id;
}

function getLabel(item: { id: string; label: string } | string): string {
  return typeof item === 'string' ? item : item.label;
}

export function CriteriaListPane({ items, selectedIds, focusedIds, onSelect }: CriteriaListPaneProps) {
  return (
    <div className={Styles.listPane}>
      {items.map((item) => {
        const id = getId(item);
        const label = getLabel(item);
        const isFocused = focusedIds?.includes(id) ?? false;
        const isSelected = !isFocused && selectedIds.includes(id);
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`${Styles.listItem} ${
              isFocused
                ? Styles.listFocused
                : isSelected
                  ? Styles.listSelected
                  : Styles.listIdle
            }`}
          >
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

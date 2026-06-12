import { Styles } from '../Condition.styles';

interface CriteriaListPaneProps {
  items: readonly { id: string; label: string }[] | readonly string[];
  selectedIds: string[];
  onSelect: (id: string) => void;
}

function getId(item: { id: string; label: string } | string): string {
  return typeof item === 'string' ? item : item.id;
}

function getLabel(item: { id: string; label: string } | string): string {
  return typeof item === 'string' ? item : item.label;
}

export function CriteriaListPane({ items, selectedIds, onSelect }: CriteriaListPaneProps) {
  return (
    <div className={Styles.listPane}>
      {items.map((item) => {
        const id = getId(item);
        const label = getLabel(item);
        const isSelected = selectedIds.includes(id);
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`${Styles.listItem} ${isSelected ? Styles.listSelected : Styles.listIdle}`}
          >
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
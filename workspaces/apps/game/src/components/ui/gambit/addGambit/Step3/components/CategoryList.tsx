import { ACTION_CATEGORIES } from '../../../mockData';
import { Styles } from '../Intent.styles';

interface CategoryListProps {
  activeCategoryId: string;
  onSelect: (id: string) => void;
}

export function CategoryList({ activeCategoryId, onSelect }: CategoryListProps) {
  return (
    <div className={Styles.colCategories}>
      <span className={Styles.catLabel}>Catégories</span>
      {ACTION_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`${Styles.catBtnBase} ${activeCategoryId === cat.id ? Styles.catBtnActive : Styles.catBtnIdle}`}
        >
          {cat.icon}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
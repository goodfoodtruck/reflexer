import { useState } from 'react';
import { SORT_CATEGORIES, SORTS_ALL } from '@components/ui/gambit/sorts/sortRegistry';
import type { SortCategoryId } from '@components/ui/gambit/sorts/sortRegistry';

interface Props {
  value: string | null;
  onChange: (sortId: string) => void;
}

export function SortFlatPicker({ value, onChange }: Props) {
  const activeCategoryId = value
    ? (SORTS_ALL.find((s) => s.sort === value)?.categoryId ?? null)
    : null;

  const [selectedCat, setSelectedCat] = useState<SortCategoryId | null>(activeCategoryId);

  const handleSelectCat = (id: SortCategoryId) => {
    setSelectedCat(id === selectedCat ? null : id);
  };

  const catOptions = selectedCat
    ? SORTS_ALL.filter((s) => s.categoryId === selectedCat)
    : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SORT_CATEGORIES.map((cat) => {
          const isActive = selectedCat === cat.id;
          const hasValue = SORTS_ALL.some((s) => s.categoryId === cat.id && s.sort === value);
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCat(cat.id as SortCategoryId)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-widest uppercase transition-all duration-150 ${
                hasValue
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                  : isActive
                    ? 'border-slate-500 bg-slate-700/50 text-slate-200'
                    : 'border-slate-700 bg-slate-800/40 text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {selectedCat && catOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-slate-700/60">
          {catOptions.map((s) => {
            const isSelected = value === s.sort;
            return (
              <button
                key={s.sort}
                onClick={() => onChange(s.sort)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-150 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                    : 'border-slate-700 bg-slate-800/40 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {s.fullLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

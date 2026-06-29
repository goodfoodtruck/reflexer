import { useState, Fragment } from 'react';
import type { Scope } from '@components/ui/gambit/GambitTypes';
import type { CategoryDefinition, CategoryId, BlockValue } from '@components/ui/gambit/filters/filterRegistry';
import { formatBlockValue, sameBlockValue } from '@components/ui/gambit/filters/filterRegistry';
import { CATEGORY_CHIP_STYLES, DEFAULT_CHIP_STYLE } from './filterChip.constants';
import { OperatorButton } from './OperatorButton';

interface PendingEntry {
  categoryId: CategoryId;
  value: BlockValue;
}

export type AddBatch = {
  categoryId: CategoryId;
  values: BlockValue[];
  valuesOp: 'AND' | 'OR';
};

interface Props {
  scope: Scope;
  categories: readonly CategoryDefinition[];
  selectedCat: CategoryId | null;
  onSelectCat: (id: CategoryId) => void;
  onAdd: (batch: AddBatch[]) => void;
  onCancel: () => void;
}

function groupEntriesByCategory(entries: PendingEntry[]): Array<{ catId: CategoryId; values: BlockValue[] }> {
  const result: Array<{ catId: CategoryId; values: BlockValue[] }> = [];
  for (const entry of entries) {
    const existing = result.find((g) => g.catId === entry.categoryId);
    if (existing) existing.values.push(entry.value);
    else result.push({ catId: entry.categoryId, values: [entry.value] });
  }
  return result;
}

function buildAddBatch(entries: PendingEntry[], valuesOpByCat: Partial<Record<string, 'AND' | 'OR'>>): AddBatch[] {
  const byCat = new Map<CategoryId, BlockValue[]>();
  for (const entry of entries) {
    const vals = byCat.get(entry.categoryId) ?? [];
    vals.push(entry.value);
    byCat.set(entry.categoryId, vals);
  }
  return Array.from(byCat.entries()).map(([catId, values]) => ({
    categoryId: catId,
    values,
    valuesOp: valuesOpByCat[catId] ?? 'OR',
  }));
}

export function ConditionInlinePicker({ categories, selectedCat, onSelectCat, onAdd, onCancel }: Props) {
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [valuesOpByCat, setValuesOpByCat] = useState<Partial<Record<string, 'AND' | 'OR'>>>({});

  const catDef  = selectedCat ? categories.find((c) => c.id === selectedCat) : null;
  const options = catDef?.options ?? [];

  const isEntrySelected = (catId: CategoryId, value: BlockValue) =>
    pendingEntries.some((e) => e.categoryId === catId && sameBlockValue(e.value, value));

  const toggleValue = (value: BlockValue) => {
    if (!selectedCat) return;
    setPendingEntries((prev) =>
      isEntrySelected(selectedCat, value)
        ? prev.filter((e) => !(e.categoryId === selectedCat && sameBlockValue(e.value, value)))
        : [...prev, { categoryId: selectedCat, value }]
    );
  };

  const removeEntry = (catId: CategoryId, value: BlockValue) => {
    setPendingEntries((prev) =>
      prev.filter((e) => !(e.categoryId === catId && sameBlockValue(e.value, value)))
    );
  };

  const toggleCatOp = (catId: CategoryId) => {
    setValuesOpByCat((prev) => ({
      ...prev,
      [catId]: (prev[catId] ?? 'OR') === 'OR' ? 'AND' : 'OR',
    }));
  };

  const handleConfirm = () => {
    if (pendingEntries.length === 0) return;
    onAdd(buildAddBatch(pendingEntries, valuesOpByCat));
    setPendingEntries([]);
    setValuesOpByCat({});
  };

  const grouped = groupEntriesByCategory(pendingEntries);

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-4">

      {pendingEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-amber-500/10">
          {grouped.map(({ catId, values }, gi) => {
            const style    = CATEGORY_CHIP_STYLES[catId] ?? DEFAULT_CHIP_STYLE;
            const catLabel = categories.find((c) => c.id === catId)?.label ?? catId;
            const op       = valuesOpByCat[catId] ?? 'OR';

            return (
              <Fragment key={catId}>
                {gi > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">ET</span>
                )}
                <div className={`flex items-stretch rounded-lg border overflow-hidden bg-slate-900/70 ${style.chip}`}>
                  <div className={`flex items-center px-2.5 py-1.5 ${style.header} border-r border-current/20`}>
                    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                      {catLabel}
                    </span>
                  </div>
                  <div className="flex items-center px-2.5 py-1.5 gap-1.5 flex-wrap">
                    {values.map((v, vi) => (
                      <Fragment key={vi}>
                        {vi > 0 && (
                          <OperatorButton op={op as 'AND' | 'OR'} onClick={() => toggleCatOp(catId)} />
                        )}
                        <button
                          onClick={() => removeEntry(catId, v)}
                          className="group/val flex items-center gap-1 text-xs font-semibold hover:text-rose-400 transition-colors"
                        >
                          {formatBlockValue(catId, v)}
                          <span className="opacity-0 group-hover/val:opacity-100 text-[10px] leading-none">×</span>
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">Catégorie</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCat(cat.id)}
              className={`px-3 py-1.5 rounded-md border text-xs font-bold tracking-widest uppercase transition-all duration-150 ${
                selectedCat === cat.id
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                  : 'border-slate-700 bg-transparent text-slate-500 hover:text-slate-300 hover:border-slate-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {catDef && (
        <div className="flex flex-wrap gap-2">
          {options.map((opt, i) => {
            const isSelected = isEntrySelected(selectedCat!, opt.value);
            return (
              <button
                key={i}
                onClick={() => toggleValue(opt.value)}
                className={`px-3 py-1.5 rounded-md border text-xs font-bold transition-all duration-150 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleConfirm}
          disabled={pendingEntries.length === 0}
          className="px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Valider
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

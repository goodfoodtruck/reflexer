import { useState, Fragment } from 'react';
import type { Scope } from '../../GambitTypes';
import type { CategoryDefinition, CategoryId, BlockValue } from '../../filters/filterRegistry';
import { formatBlockValue } from '../../filters/filterRegistry';

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

const CAT_STYLE: Record<string, { chip: string; header: string }> = {
  health:            { chip: 'border-rose-500/40   text-rose-200',    header: 'bg-rose-500/20   text-rose-300' },
  armor:             { chip: 'border-slate-500/40  text-slate-200',   header: 'bg-slate-500/20  text-slate-300' },
  energy:            { chip: 'border-yellow-500/40 text-yellow-200',  header: 'bg-yellow-500/20 text-yellow-300' },
  status:            { chip: 'border-purple-500/40 text-purple-200',  header: 'bg-purple-500/20 text-purple-300' },
  distance_me:       { chip: 'border-sky-500/40    text-sky-200',     header: 'bg-sky-500/20    text-sky-300' },
  in_range_of_ally:  { chip: 'border-emerald-500/40 text-emerald-200', header: 'bg-emerald-500/20 text-emerald-300' },
  in_range_of_enemy: { chip: 'border-orange-500/40  text-orange-200',  header: 'bg-orange-500/20  text-orange-300' },
};
const DEFAULT_STYLE = { chip: 'border-slate-600/50 text-slate-200', header: 'bg-slate-700/50 text-slate-400' };

export function ConditionInlinePicker({ categories, selectedCat, onSelectCat, onAdd, onCancel }: Props) {
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [valuesOpByCat, setValuesOpByCat] = useState<Partial<Record<string, 'AND' | 'OR'>>>({});

  const catDef = selectedCat ? categories.find((c) => c.id === selectedCat) : null;
  const options = catDef?.options ?? [];

  const isSelected = (catId: CategoryId, v: BlockValue) =>
    pendingEntries.some(
      (e) => e.categoryId === catId && JSON.stringify(e.value) === JSON.stringify(v)
    );

  const toggleValue = (v: BlockValue) => {
    if (!selectedCat) return;
    setPendingEntries((prev) =>
      isSelected(selectedCat, v)
        ? prev.filter(
            (e) =>
              !(e.categoryId === selectedCat && JSON.stringify(e.value) === JSON.stringify(v))
          )
        : [...prev, { categoryId: selectedCat, value: v }]
    );
  };

  const removeEntry = (catId: CategoryId, v: BlockValue) => {
    setPendingEntries((prev) =>
      prev.filter(
        (e) => !(e.categoryId === catId && JSON.stringify(e.value) === JSON.stringify(v))
      )
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
    // Group by category preserving insertion order
    const byCat = new Map<CategoryId, BlockValue[]>();
    for (const entry of pendingEntries) {
      const vals = byCat.get(entry.categoryId) ?? [];
      vals.push(entry.value);
      byCat.set(entry.categoryId, vals);
    }
    const batch: AddBatch[] = Array.from(byCat.entries()).map(([catId, values]) => ({
      categoryId: catId,
      values,
      valuesOp: (valuesOpByCat[catId] ?? 'OR') as 'AND' | 'OR',
    }));
    onAdd(batch);
    setPendingEntries([]);
    setValuesOpByCat({});
  };

  // Group pending entries by category for display
  const grouped: Array<{ catId: CategoryId; values: BlockValue[] }> = [];
  for (const entry of pendingEntries) {
    const existing = grouped.find((g) => g.catId === entry.categoryId);
    if (existing) existing.values.push(entry.value);
    else grouped.push({ catId: entry.categoryId, values: [entry.value] });
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-4">

      {/* Zone d'accumulation : chips immédiates avec ET/OU toggleables */}
      {pendingEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-amber-500/10">
          {grouped.map(({ catId, values }, gi) => {
            const style = CAT_STYLE[catId] ?? DEFAULT_STYLE;
            const catLabel = categories.find((c) => c.id === catId)?.label ?? catId;
            const op = valuesOpByCat[catId] ?? 'OR';

            return (
              <Fragment key={catId}>
                {gi > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">
                    ET
                  </span>
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
                          <button
                            onClick={() => toggleCatOp(catId)}
                            title="Basculer ET / OU"
                            className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest transition-colors ${
                              op === 'AND'
                                ? 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/25'
                                : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25'
                            }`}
                          >
                            {op === 'AND' ? 'ET' : 'OU'}
                          </button>
                        )}
                        <button
                          onClick={() => removeEntry(catId, v)}
                          className="group/val flex items-center gap-1 text-xs font-semibold hover:text-rose-400 transition-colors"
                        >
                          {formatBlockValue(catId, v)}
                          <span className="opacity-0 group-hover/val:opacity-100 text-[10px] leading-none">
                            ×
                          </span>
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

      {/* Sélecteur de catégorie */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">
          Catégorie
        </span>
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

      {/* Options de valeurs pour la catégorie sélectionnée */}
      {catDef && (
        <div className="flex flex-wrap gap-2">
          {options.map((opt, i) => {
            const sel = isSelected(selectedCat!, opt.value);
            return (
              <button
                key={i}
                onClick={() => toggleValue(opt.value)}
                className={`px-3 py-1.5 rounded-md border text-xs font-bold transition-all duration-150 ${
                  sel
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

      {/* Actions */}
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

import { Fragment } from 'react';
import { IconPlus } from '@assets/icons/IconPlus';
import { IconTrash } from '@assets/icons/IconTrash';
import {
  formatBlockValue,
  getCategory,
  type CategoryId,
  type FilterEntry,
} from '@components/ui/gambit/filters/filterRegistry';
import { Styles_conditionStack } from './blockStack.styles';

function IconSwitch() {
  return (
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 5h12M11 2l3 3-3 3M14 11H2M5 8l-3 3 3 3" />
    </svg>
  );
}

interface PendingBlockViewProps {
  entries: FilterEntry[];
  pendingValuesOperators: Record<string, 'AND' | 'OR'>;
  pendingGroupOperator: 'AND' | 'OR';
  onRemoveEntry: (entry: FilterEntry) => void;
  onConfirmBlock: () => void;
  onTogglePendingValuesOperator: (categoryId: CategoryId) => void;
  onTogglePendingGroupOperator: () => void;
}

/**
 * Bloc en cours de construction : entrées groupées par catégorie avec opérateurs ET/OU
 * toggleables. Utilisé aussi bien dans l'éditeur de conditions (Step 2) que dans
 * la sélection de filtres cible (Step 4).
 */
export function PendingBlockView({
  entries,
  pendingValuesOperators,
  pendingGroupOperator,
  onRemoveEntry,
  onConfirmBlock,
  onTogglePendingValuesOperator,
  onTogglePendingGroupOperator,
}: PendingBlockViewProps) {
  const grouped = new Map<CategoryId, FilterEntry[]>();
  for (const entry of entries) {
    const arr = grouped.get(entry.categoryId) ?? [];
    arr.push(entry);
    grouped.set(entry.categoryId, arr);
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full rounded-xl border border-slate-700/60 bg-[#0d1018] overflow-hidden">
        {Array.from(grouped.entries()).map(([categoryId, catEntries], ci) => {
          const pvo = pendingValuesOperators[categoryId] ?? 'OR';
          return (
            <div key={categoryId} className={`${ci > 0 ? 'border-t border-slate-800/80' : ''}`}>
              {/* Connecteur inter-catégories */}
              {ci > 0 && (
                <div className="flex items-center justify-center py-1.5 bg-[#080b12]">
                  <button
                    onClick={onTogglePendingGroupOperator}
                    className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${
                      pendingGroupOperator === 'AND'
                        ? 'text-sky-300 border-sky-500/50 bg-sky-500/10 hover:bg-sky-500/20'
                        : 'text-amber-300 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20'
                    }`}
                    title="Basculer ET / OU entre les groupes"
                  >
                    <IconSwitch />
                    {pendingGroupOperator === 'AND' ? 'ET' : 'OU'}
                  </button>
                </div>
              )}
              <div className="px-4 py-3">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 pt-1.5 shrink-0">
                    {getCategory(categoryId).label}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {catEntries.map((entry, vi) => (
                      <Fragment key={vi}>
                        {vi > 0 && (
                          <button
                            onClick={() => onTogglePendingValuesOperator(categoryId)}
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
                              pvo === 'AND'
                                ? 'text-sky-300 border-sky-500/50 bg-sky-500/10 hover:bg-sky-500/20'
                                : 'text-amber-300 border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20'
                            }`}
                          >
                            {pvo === 'AND' ? 'ET' : 'OU'}
                          </button>
                        )}
                        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 rounded-lg px-2 py-1 group/val">
                          <span className="text-[10px] font-semibold text-slate-200">
                            {formatBlockValue(categoryId, entry.value)}
                          </span>
                          <button
                            onClick={() => onRemoveEntry(entry)}
                            className="opacity-0 group-hover/val:opacity-100 text-slate-500 hover:text-rose-400 transition-all ml-0.5"
                            title="Retirer"
                          >
                            <IconTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button className={Styles_conditionStack.stackAddBtn} onClick={onConfirmBlock}>
        <IconPlus />
      </button>
    </div>
  );
}

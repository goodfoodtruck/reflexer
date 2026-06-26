import { motion } from 'framer-motion';
import type { DraftGambit, Scope } from '../../GambitTypes';
import { useTargetStep } from './useTargetStep';
import { TargetKindSelector } from './components/TargetKindSelector';
import { TargetFilterList } from './components/TargetFilterList';
import { ConditionInlinePicker } from '../shared/ConditionInlinePicker';
import { SortFlatPicker } from '../shared/SortFlatPicker';

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function TargetStep({ draft, updateDraft }: Props) {
  const {
    pickerOpen,
    pickerCat,
    setPickerCat,
    filterCategories,
    handleSelectKind,
    handleAddFilters,
    handleRemoveFilter,
    handleSelectSort,
    openPicker,
    closePicker,
  } = useTargetStep({ draft, updateDraft });

  const isSelf = draft.targetKind === 'SELF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-2">Qui cibler ?</h2>
        <p className="text-sm text-slate-400 font-medium">
          Choisissez le type de cible, les critères de sélection et la priorité.
        </p>
      </div>

      <TargetKindSelector
        selectedKind={(draft.targetKind as Scope) || null}
        onSelect={handleSelectKind}
      />

      {!isSelf && draft.targetKind && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">
              Filtrer les candidats
            </span>
            <p className="text-xs text-slate-500">
              Seules les cibles correspondant à tous les critères ci-dessous seront considérées.
            </p>

            <TargetFilterList
              filters={draft.targetFilters}
              onRemove={handleRemoveFilter}
            />

            {!pickerOpen ? (
              <button
                onClick={openPicker}
                className="self-start flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 text-xs font-bold uppercase tracking-widest transition-all duration-150"
              >
                <span className="text-base leading-none">+</span>
                Ajouter un filtre
              </button>
            ) : (
              <ConditionInlinePicker
                scope={draft.targetKind as Scope}
                categories={filterCategories}
                selectedCat={pickerCat}
                onSelectCat={setPickerCat}
                onAdd={handleAddFilters}
                onCancel={closePicker}
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/70">
              Priorité de sélection
            </span>
            <p className="text-xs text-slate-500">
              Si plusieurs cibles sont éligibles, laquelle choisir en priorité.
            </p>
            <SortFlatPicker
              value={draft.targetSort || null}
              onChange={handleSelectSort}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

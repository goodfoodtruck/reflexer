import { motion } from 'framer-motion';
import type { DraftGambit } from '../../GambitTypes';
import { useConditionStep } from './hooks/useConditionStep';
import { ScopeTabs } from '../shared/ScopeTabs';
import { ConditionList } from './components/ConditionList';
import { ConditionInlinePicker } from '../shared/ConditionInlinePicker';

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function ConditionStep({ draft, updateDraft }: Props) {
  const {
    activeScope,
    setActiveScope,
    pickerOpen,
    pickerCat,
    setPickerCat,
    availableCategories,
    conditionsForScope,
    conditionCounts,
    scopesWithConditions,
    handleAddConditions,
    handleRemoveCondition,
    handleToggleScopeOp,
    handleToggleValuesOp,
    handleToggleNegated,
    handleToggleGlobalOp,
    openPicker,
    closePicker,
  } = useConditionStep({ draft, updateDraft });

  const conditions = conditionsForScope(activeScope);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-2">Quand agir ?</h2>
        <p className="text-sm text-slate-400 font-medium">
          Définissez les conditions qui déclenchent ce gambit. Sans conditions, il est toujours actif.
        </p>
      </div>

      <ScopeTabs
        activeScope={activeScope}
        onSelect={setActiveScope}
        conditionCounts={conditionCounts}
        globalOp={draft.operator}
        onToggleGlobalOp={handleToggleGlobalOp}
      />

      <div className="mt-5 flex flex-col gap-4 flex-1">
        <ConditionList
          conditions={conditions}
          scope={activeScope}
          onRemove={handleRemoveCondition}
          onToggleOperator={handleToggleScopeOp}
          onToggleValuesOperator={handleToggleValuesOp}
          onToggleNegated={handleToggleNegated}
        />

        {!pickerOpen ? (
          <button
            onClick={openPicker}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 text-xs font-bold uppercase tracking-widest transition-all duration-150"
          >
            <span className="text-base leading-none">+</span>
            Ajouter une condition
          </button>
        ) : (
          <ConditionInlinePicker
            scope={activeScope}
            categories={availableCategories}
            selectedCat={pickerCat}
            onSelectCat={setPickerCat}
            onAdd={(batch) => handleAddConditions(activeScope, batch)}
            onCancel={closePicker}
          />
        )}
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import type { DraftGambit } from '../../GambitTypes';
import { useConditionStep } from './hooks/useConditionStep';
import { SelectTargetView } from './components/SelectTargetView';
import { BuildConditionView } from './components/BuildConditionView';
import { Styles } from './Condition.styles';

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function ConditionStep({ draft, updateDraft }: Props) {
  const {
    viewMode,
    activeTargetContext,
    configuredTargets,
    blocks,
    blockOperators,
    currentCat,
    currentBlockEntries,
    catOptions,
    availableCategories,
    bannerText,
    canSave,
    pendingValuesOperators,
    handleSelectTarget,
    handleToggleValue,
    handleConfirmBlock,
    handleSaveConditionGroup,
    handleCancelBuild,
    handleToggleBlockOperator,
    handleToggleBlockValuesOperator,
    handleTogglePendingValuesOperator,
    setCurrentCat,
    handleRemoveBlock,
    handleRemoveCurrentEntry,
    handleRemoveTarget,
  } = useConditionStep({ draft, updateDraft });

  if (viewMode === 'BUILD_CONDITION') {
    if (activeTargetContext === 'OTHER') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${Styles.container} items-center justify-center gap-6`}
        >
          <div className="flex flex-col items-center gap-3 text-center max-w-xs">
            <span className="text-3xl opacity-40">⚙</span>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun filtre disponible</p>
            <p className="text-xs text-slate-500">
              Les filtres pour la cible <span className="text-slate-300 font-semibold">OTHER</span> ne sont pas encore configurés.
            </p>
            <button
              onClick={handleCancelBuild}
              className="mt-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <BuildConditionView
        activeTargetContext={activeTargetContext}
        bannerText={bannerText}
        blocks={blocks}
        blockOperators={blockOperators}
        currentCat={currentCat}
        currentBlockEntries={currentBlockEntries}
        catOptions={catOptions}
        availableCategories={availableCategories}
        canSave={canSave}
        pendingValuesOperators={pendingValuesOperators}
        onBack={handleCancelBuild}
        onSelectCat={setCurrentCat}
        onToggleValue={handleToggleValue}
        onConfirmBlock={handleConfirmBlock}
        onRemoveBlock={handleRemoveBlock}
        onRemoveCurrentEntry={handleRemoveCurrentEntry}
        onToggleBlockOperator={handleToggleBlockOperator}
        onToggleBlockValuesOperator={handleToggleBlockValuesOperator}
        onTogglePendingValuesOperator={handleTogglePendingValuesOperator}
        onSave={handleSaveConditionGroup}
      />
    );
  }

  return (
    <SelectTargetView
      configuredTargets={configuredTargets}
      onSelectTarget={handleSelectTarget}
      onRemoveTarget={handleRemoveTarget}
    />
  );
}

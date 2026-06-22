import type { DraftGambit } from '../../GambitTypes';
import { useConditionStep } from './hooks/useConditionStep';
import { SelectTargetView } from './components/SelectTargetView';
import { BuildConditionView } from './components/BuildConditionView';

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
    blockOperator,
    currentCat,
    currentValues,
    catOptions,
    availableCategories,
    bannerText,
    canSave,
    handleSelectTarget,
    handleToggleValue,
    handleConfirmBlock,
    handleSaveConditionGroup,
    handleCancelBuild,
    handleToggleBlockOperator,
    setCurrentCat,
    handleRemoveBlock,
    handleRemoveCurrentValue,
    handleRemoveTarget,
  } = useConditionStep({ draft, updateDraft });

  if (viewMode === 'BUILD_CONDITION') {
    return (
      <BuildConditionView
        activeTargetContext={activeTargetContext}
        bannerText={bannerText}
        blocks={blocks}
        blockOperator={blockOperator}
        currentCat={currentCat}
        currentValues={currentValues}
        catOptions={catOptions}
        availableCategories={availableCategories}
        canSave={canSave}
        onBack={handleCancelBuild}
        onSelectCat={setCurrentCat}
        onToggleValue={handleToggleValue}
        onConfirmBlock={handleConfirmBlock}
        onRemoveBlock={handleRemoveBlock}
        onRemoveCurrentValue={handleRemoveCurrentValue}
        onToggleBlockOperator={handleToggleBlockOperator}
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
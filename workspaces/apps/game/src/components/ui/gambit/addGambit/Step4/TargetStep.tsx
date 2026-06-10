import { IconEnemy } from '../../../../../assets/icons/IconEnemy';
import { IconCharacter } from '../../../../../assets/icons/IconCharacter';
import { IconSelf } from '../../../../../assets/icons/IconSelf';
import type { DraftGambit } from '../../GambitTypes';
import { SORT_CATEGORIES } from '../../gambitEditorOptions';
import { useTargetStep } from './useTargetStep';
import { StepSelectTarget } from './components/StepSelectTarget';
import { StepFilterCriteria } from './components/StepFilterCriteria';
import { StepSortPriority } from './components/StepSortPriority';

const TARGET_KINDS = [
  { id: 'ENEMY', icon: <IconEnemy /> },
  { id: 'ALLY', icon: <IconCharacter /> },
  { id: 'SELF', icon: <IconSelf /> }
];

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function TargetStep({ draft, updateDraft }: Props) {
  const {
    internalStep,
    setInternalStep,
    configuredTarget,
    localKind,
    sortVal,
    setSortVal,
    filterBlocks,
    currentFilterCat,
    setCurrentFilterCat,
    currentFilterVals,
    sortCat,
    setSortCat,
    catOptions,
    handleSelectKind,
    handleToggleFilterVal,
    handleConfirmFilterBlock,
    handleRemoveFilter,
    handleGoToSort,
    handleSave,
    handleReset
  } = useTargetStep({ draft, updateDraft });

  const activeIcon = TARGET_KINDS.find((t) => t.id === localKind)?.icon;
  const sortOptions = sortCat ? (SORT_CATEGORIES.find((c) => c.id === sortCat)?.options ?? []) : [];

  if (internalStep === 1)
    return (
      <StepSelectTarget
        configuredTarget={configuredTarget}
        onSelectKind={handleSelectKind}
        onEdit={() => setInternalStep(2)}
        onReset={handleReset}
        onRemoveFilter={handleRemoveFilter}
      />
    );

  if (internalStep === 2)
    return (
      <StepFilterCriteria
        localKind={localKind}
        activeIcon={activeIcon}
        filterBlocks={filterBlocks}
        currentFilterCat={currentFilterCat}
        currentFilterVals={currentFilterVals}
        catOptions={catOptions}
        onSelectCat={setCurrentFilterCat}
        onToggleVal={handleToggleFilterVal}
        onConfirmBlock={handleConfirmFilterBlock}
        onCancel={() => setInternalStep(1)}
        onNext={handleGoToSort}
      />
    );

  return (
    <StepSortPriority
      localKind={localKind}
      activeIcon={activeIcon}
      sortVal={sortVal}
      sortCat={sortCat}
      sortOptions={sortOptions}
      onSelectSortCat={(id) => {
        setSortCat(id);
        setSortVal(null);
      }}
      onSelectSortVal={setSortVal}
      onBack={() => setInternalStep(2)}
      onSave={handleSave}
    />
  );
}

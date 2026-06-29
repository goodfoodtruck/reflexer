import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { DraftGambit } from './GambitTypes';
import { Style_gambit_edition } from './Gambit.styles';
import { SituationStep } from './addGambit/Step1';
import { ConditionStep } from './addGambit/Step2';
import { IntentStep } from './addGambit/Step3/IntentStep';
import { TargetStep } from './addGambit/Step4/TargetStep';
import { RecapStep } from './addGambit/Step5/RecapStep';
import { buildInitialDraft } from './gambit.adapter';
import type { StoredGambit } from '@services/gambit.service';

const STEPS = [
  { num: 1, label: 'Situation' },
  { num: 2, label: 'Conditions' },
  { num: 3, label: 'Intention' },
  { num: 4, label: 'Cible' },
  { num: 5, label: 'Récap' },
];

const TOTAL_STEPS = STEPS.length;

const STEP_VALIDATION: Partial<Record<number, (draft: DraftGambit) => boolean>> = {
  1: (draft) => draft.name === '',
  3: (draft) => draft.intentValue === '',
  4: (draft) => draft.targetSort === '',
};

function getNextButtonLabel(currentStep: number): string {
  if (currentStep === TOTAL_STEPS)     return 'Confirmer & Sauvegarder';
  if (currentStep === TOTAL_STEPS - 1) return 'Voir le récapitulatif';
  return 'Étape suivante';
}

interface Props {
  initialGambit?: StoredGambit;
  onCancel: () => void;
  onSave: (gambit: DraftGambit) => void;
}

export function GambitEdition({ initialGambit, onCancel, onSave }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<DraftGambit>(() => buildInitialDraft(initialGambit));

  const updateDraft = useCallback((updates: Partial<DraftGambit>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  const isNextDisabled = STEP_VALIDATION[currentStep]?.(draft) ?? false;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((prev) => prev + 1);
    else onSave(draft);
  };

  const stepComponents: Record<number, React.ReactNode> = {
    1: <SituationStep draft={draft} updateDraft={updateDraft} />,
    2: <ConditionStep draft={draft} updateDraft={updateDraft} />,
    3: <IntentStep    draft={draft} updateDraft={updateDraft} />,
    4: <TargetStep    draft={draft} updateDraft={updateDraft} />,
    5: <RecapStep     draft={draft} />,
  };

  return (
    <div className={Style_gambit_edition.container}>
      <div className={Style_gambit_edition.header}>
        <div className="flex items-center justify-between relative">
          <div className={Style_gambit_edition.timeline} />
          {STEPS.map((s) => (
            <div key={s.num} className={Style_gambit_edition.stepWrapper}>
              <div className={`${Style_gambit_edition.circle} ${currentStep >= s.num ? Style_gambit_edition.circleActive : Style_gambit_edition.circlePending}`}>
                {s.num}
              </div>
              <span className={`${Style_gambit_edition.label} ${currentStep >= s.num ? Style_gambit_edition.labelActive : Style_gambit_edition.labelPending}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={Style_gambit_edition.body}>
        <div className={Style_gambit_edition.glow} />
        <div className={`${Style_gambit_edition.content} ${currentStep >= 2 ? 'max-w-7xl' : 'max-w-xl'}`}>
          <AnimatePresence mode="wait">{stepComponents[currentStep]}</AnimatePresence>
        </div>
      </div>

      <div className={Style_gambit_edition.footer}>
        <button onClick={onCancel} className={`${Style_gambit_edition.btnBase} ${Style_gambit_edition.btnCancel}`}>
          Annuler
        </button>
        <div className={Style_gambit_edition.footerRight}>
          {currentStep > 1 && (
            <button onClick={() => setCurrentStep((p) => p - 1)} className={`${Style_gambit_edition.btnBase} ${Style_gambit_edition.btnBack}`}>
              Retour
            </button>
          )}
          <button onClick={handleNext} disabled={isNextDisabled} className={`${Style_gambit_edition.btnBase} ${Style_gambit_edition.btnNext}`}>
            {getNextButtonLabel(currentStep)}
          </button>
        </div>
      </div>
    </div>
  );
}

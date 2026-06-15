import { useState, useEffect } from 'react';

export type GuideStep = {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
};

export type GuideName = 'home' | 'team-selection' | 'gambit-editor';

const STORAGE_KEY = 'reflexer_guide_seen';

export function useGuide(name: GuideName, steps: GuideStep[]) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (!seen[name]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
    }
  }, [name]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      close();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const close = () => {
    const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    seen[name] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    setIsVisible(false);
    setCurrentStep(0);
  };

  const reset = () => {
    const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    seen[name] = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    setIsVisible(true);
    setCurrentStep(0);
  };

  return {
    isVisible,
    currentStep,
    step: steps[currentStep]!,
    total: steps.length,
    next,
    prev,
    close,
    reset
  };
}

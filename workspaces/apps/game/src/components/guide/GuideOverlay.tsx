import { useEffect, useRef, useState } from 'react';
import type { GuideStep } from './useGuide';
import {
  clampToViewport,
  getRectFromElement,
  getTooltipPosition,
  type DirectionPosition
} from '../../utils/guide';
import { guideStyles } from './stylesGuide';

type Props = {
  step: GuideStep;
  currentStep: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
};

export function GuideOverlay({ step, currentStep, total, onNext, onPrev, onClose }: Props) {
  const [targetRect, setTargetRect] = useState<DirectionPosition | null>(null);
  const [tooltipRect, setTooltipRect] = useState<DirectionPosition | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTargetRect(getRectFromElement(step.target)), 100);
    return () => clearTimeout(timer);
  }, [step.target]);

  useEffect(() => {
    if (tooltipRef.current) {
      const r = tooltipRef.current.getBoundingClientRect();
      setTooltipRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
  }, [targetRect]);

  const positionStyle = clampToViewport(getTooltipPosition(targetRect, step.position), tooltipRect);

  return (
    <>
      <div style={guideStyles.overlay} onClick={onClose}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <mask id="guide-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#guide-mask)" />
        </svg>

        {targetRect && (
          <div
            style={{
              ...guideStyles.highlight,
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16
            }}
          />
        )}
      </div>

      <div
        ref={tooltipRef}
        onClick={(e) => e.stopPropagation()}
        style={{ ...guideStyles.tooltip, ...positionStyle }}
      >
        <div style={guideStyles.header}>
          <div>
            <div style={guideStyles.label}>
              GUIDE · {currentStep + 1}/{total}
            </div>
            <div style={guideStyles.title}>{step.title}</div>
          </div>
          <button onClick={onClose} style={guideStyles.closeBtn}>
            ×
          </button>
        </div>

        <p style={guideStyles.description}>{step.description}</p>

        <div style={guideStyles.dotsRow}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={i === currentStep ? guideStyles.dotActive : guideStyles.dotInactive}
            />
          ))}
        </div>

        <div style={guideStyles.buttonsRow}>
          {currentStep > 0 && (
            <button onClick={onPrev} style={guideStyles.btnPrev}>
              RETOUR
            </button>
          )}
          <button onClick={onNext} style={guideStyles.btnNext}>
            {currentStep < total - 1 ? 'SUIVANT' : 'TERMINER'}
          </button>
        </div>

        <div style={guideStyles.skipRow}>
          <button onClick={onClose} style={guideStyles.skipBtn}>
            Passer le guide
          </button>
        </div>
      </div>
    </>
  );
}

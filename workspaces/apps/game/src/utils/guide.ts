import type { GuideStep } from '@components/guide';

export type DirectionPosition = { top: number; left: number; width: number; height: number };

const GAP = 20; // espace de 20px entre tooltip et mon element x
const MARGIN = 16; // distance de 16px entre le tooltip et le bord de ma fenetre

export const getRectFromElement = (dataGuideId: string): DirectionPosition | null => {
  const elementSelected = document.querySelector(dataGuideId);
  if (!elementSelected) return null;
  const result = elementSelected.getBoundingClientRect();
  return { top: result.top, left: result.left, width: result.width, height: result.height };
};

export const getTooltipPosition = (
  rect: DirectionPosition | null,
  position: GuideStep['position']
): React.CSSProperties => {
  if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  switch (position) {
    case 'top':
      return {
        top: rect.top - GAP,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)'
      };
    case 'bottom':
      return {
        top: rect.top + rect.height + GAP,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)'
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - GAP,
        transform: 'translate(-100%, -50%)'
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width + GAP,
        transform: 'translateY(-50%)'
      };
  }
};

export const clampToViewport = (
  style: React.CSSProperties,
  tooltipRect: DirectionPosition | null
): React.CSSProperties => {
  if (!tooltipRect) return style;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const result = { ...style };
  const left = typeof result.left === 'number' ? result.left : 0;
  const top = typeof result.top === 'number' ? result.top : 0;

  if (left + tooltipRect.width > vw - MARGIN) {
    result.left = vw - tooltipRect.width - MARGIN;
    result.transform = 'none';
  }
  if (left < MARGIN) {
    result.left = MARGIN;
    result.transform = 'none';
  }
  if (top + tooltipRect.height > vh - MARGIN) {
    result.top = Math.max(MARGIN, vh - tooltipRect.height - MARGIN);
    result.transform = 'none';
  }
  if (top < MARGIN) {
    result.top = MARGIN;
    result.transform = 'none';
  }

  return result;
};

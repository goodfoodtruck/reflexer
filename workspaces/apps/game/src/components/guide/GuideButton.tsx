import { boutonStyles } from './stylesGuide';

export function GuideButton({ onClick }: { onClick: () => void }) {
  const onMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = '#f59e0b';
    e.currentTarget.style.boxShadow = '0 0 12px rgba(245,158,11,0.3)';
  };

  const onMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  };

  return (
    <button
      onClick={onClick}
      title="Relancer le guide"
      style={boutonStyles}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      ?
    </button>
  );
}

import { TARGET_OPTIONS } from '../constants/condition.constants';
import { Styles } from '../Condition.styles';

interface TargetGridProps {
  onSelectTarget: (id: string) => void;
}

export function TargetGrid({ onSelectTarget }: TargetGridProps) {
  return (
    <div className={Styles.gridWrapper}>
      <h3 className={Styles.gridTitle}>Sélectionner une cible</h3>
      <div className={Styles.gridDisplay}>
        {TARGET_OPTIONS.map((t) => (
          <button key={t.id} onClick={() => onSelectTarget(t.id)} className={Styles.gridCard}>
            <div className={Styles.gridIconGlow} />
            <div className={Styles.gridIconBox}>{t.icon}</div>
            <span className={Styles.gridLabel}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
import { Styles } from '../Condition.styles';

interface ConditionBreadcrumbProps {
  onBack?: () => void;
  activeLabel: string;
  backLabel: string;
}

export function ConditionBreadcrumb({ onBack, activeLabel, backLabel }: ConditionBreadcrumbProps) {
  return (
    <div className={Styles.navHeader}>
      {onBack ? (
        <span className="cursor-pointer hover:text-slate-300" onClick={onBack}>
          {backLabel}
        </span>
      ) : (
        <span className={Styles.navActive}>{backLabel}</span>
      )}
      <span className={Styles.navSeparator}>&gt;</span>
      <span className={onBack ? Styles.navActive : ''}>{activeLabel}</span>
    </div>
  );
}
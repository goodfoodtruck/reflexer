import { TARGET_OPTIONS } from '../constants/condition.constants';
import { Styles } from '../Condition.styles';
import { IconPlus } from '../../../../../../assets/icons/IconPlus';

interface TargetSummaryBarProps {
  configuredTargets: string[];
  onSelectTarget: (id: string) => void;
}

export function TargetSummaryBar({ configuredTargets, onSelectTarget }: TargetSummaryBarProps) {
  return (
    <div className={Styles.visualBar}>
      {configuredTargets.map((t, i) => (
        <div key={i} className="flex items-center gap-4">
          <div
            onClick={() => onSelectTarget(t)}
            className={`${Styles.visualBox} ${Styles.visualBoxFull}`}
          >
            {TARGET_OPTIONS.find((x) => x.id === t)?.icon}
          </div>
          <span className={Styles.visualAnd}>ET</span>
        </div>
      ))}
      <div className={`${Styles.visualBox} ${Styles.visualBoxAdd}`}>
        <IconPlus />
      </div>
    </div>
  );
}
import { TARGET_OPTIONS } from '../constants/condition.constants';
import { Styles } from '../Condition.styles';

interface FocusTargetIconProps {
  targetId: string | null;
}

export function FocusTargetIcon({ targetId }: FocusTargetIconProps) {
  const target = TARGET_OPTIONS.find((t) => t.id === targetId);

  return (
    <div className={Styles.focusIconWrapper}>
      <div className={Styles.focusIconGlow} />
      <div className={Styles.focusIconBox}>
        {target?.icon}
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {target?.label ?? targetId}
        </span>
      </div>
    </div>
  );
}
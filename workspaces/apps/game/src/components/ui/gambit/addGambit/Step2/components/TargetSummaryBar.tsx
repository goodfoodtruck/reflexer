import { IconPlus } from '../../../../../../assets/icons/IconPlus';
import { TARGET_OPTIONS } from '../constants/condition.constants';
import { Styles } from '../Condition.styles';

interface TargetSummaryBarProps {
  configuredTargets: string[];
  onSelectTarget: (id: string) => void;
  onRemoveTarget: (id: string) => void;
}
const style = {
  button: "absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 text-slate-400 hover:bg-rose-500 hover:border-rose-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black leading-none"
};

export function TargetSummaryBar({ configuredTargets, onSelectTarget, onRemoveTarget }: TargetSummaryBarProps) {
  return (
    <div className={Styles.visualBar}>
      {configuredTargets.map((t, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="relative group">
            <div
              onClick={() => onSelectTarget(t)}
              className={`${Styles.visualBox} ${Styles.visualBoxFull}`}
            >
              {TARGET_OPTIONS.find((x) => x.id === t)?.icon}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemoveTarget(t); }}
              className={style.button}
              title="Supprimer cette cible"
            >
              ×
            </button>
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
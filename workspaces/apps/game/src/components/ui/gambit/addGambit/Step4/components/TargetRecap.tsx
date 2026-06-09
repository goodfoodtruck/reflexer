import type { ConfiguredTarget } from '../useTargetStep';
import { formatBlockText } from '../useTargetStep';
import { Styles } from '../Target.styles';
import { IconEdit } from '../../../../../../assets/icons/IconEdit';
import { IconTrash } from '../../../../../../assets/icons/IconTrash';

interface TargetRecapProps {
  configuredTarget: ConfiguredTarget;
  targetIcon: React.ReactNode;
  onEdit: () => void;
  onReset: () => void;
}

export function TargetRecap({ configuredTarget, targetIcon, onEdit, onReset }: TargetRecapProps) {
  return (
    <div className="flex-1 flex flex-col mt-4">
      <div className={Styles.recapContainer}>
        <div className={Styles.recapGrid}>
          <div className={Styles.avatarBox}>
            {targetIcon}
            <span className="text-[10px] font-black mt-2 tracking-[0.2em]">
              {configuredTarget.kind}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <div>
              <span className={Styles.label}>Critères</span>
              <div className="flex flex-wrap gap-2">
                {configuredTarget.filters.length > 0 ? (
                  configuredTarget.filters.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="text-[10px] font-black text-slate-600">ET</span>}
                      <span
                        className={`bg-slate-800/80 border border-slate-700 text-slate-300 ${Styles.baseBadge}`}
                      >
                        {formatBlockText(b.categoryId, b.values)}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Cible par défaut</span>
                )}
              </div>
            </div>
            <div>
              <span className={Styles.label}>Priorité</span>
              <span className={`${Styles.blockSolid} ${Styles.baseBadge} self-start`}>
                {configuredTarget.sortVal?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className={Styles.recapActions}>
            <button
              onClick={onEdit}
              className={`${Styles.btnAction} text-slate-400 hover:text-amber-400`}
            >
              <IconEdit /> Éditer
            </button>
            <button
              onClick={onReset}
              className={`${Styles.btnAction} text-slate-400 hover:text-rose-500`}
            >
              <IconTrash /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

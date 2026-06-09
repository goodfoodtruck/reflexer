import { motion } from 'framer-motion';
import { IconEnemy } from '../../../../../../assets/icons/IconEnemy';
import { IconCharacter } from '../../../../../../assets/icons/IconCharacter';
import { IconOther } from '../../../../../../assets/icons/IconOther';
import type { ConfiguredTarget } from '../useTargetStep';
import { Styles } from '../Target.styles';
import { TargetRecap } from './TargetRecap';

const TARGET_KINDS = [
  { id: 'ENEMY', label: 'Enemy', icon: <IconEnemy /> },
  { id: 'ALLY', label: 'Character', icon: <IconCharacter /> },
  { id: 'OTHER', label: 'Other', icon: <IconOther /> }
];

interface StepSelectTargetProps {
  configuredTarget: ConfiguredTarget | null;
  onSelectKind: (kind: string) => void;
  onEdit: () => void;
  onReset: () => void;
}

export function StepSelectTarget({
  configuredTarget,
  onSelectKind,
  onEdit,
  onReset
}: StepSelectTargetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={Styles.container}
    >
      <div className={Styles.breadcrumb}>
        Configuration &gt; <span className={Styles.activeBread}>Type de cible</span>
      </div>
      <h3 className={Styles.title}>Cible du Gambit</h3>

      {configuredTarget ? (
        <TargetRecap
          configuredTarget={configuredTarget}
          targetIcon={TARGET_KINDS.find((t) => t.id === configuredTarget.kind)?.icon}
          onEdit={onEdit}
          onReset={onReset}
        />
      ) : (
        <div className="flex-1">
          <div className={Styles.grid4}>
            {TARGET_KINDS.map((target) => (
              <button
                key={target.id}
                onClick={() => onSelectKind(target.id)}
                className={Styles.cardBase}
              >
                <div className={Styles.iconWrapper}>{target.icon}</div>
                <span className="text-xs font-black uppercase tracking-widest">{target.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

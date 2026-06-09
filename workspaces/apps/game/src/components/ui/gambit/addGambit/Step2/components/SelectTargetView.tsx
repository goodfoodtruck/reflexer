import { motion } from 'framer-motion';
import { ANIMATIONS } from '../constants/condition.constants';
import { Styles } from '../Condition.styles';
import { ConditionBreadcrumb } from './ConditionBreadcrumb';
import { TargetSummaryBar } from './TargetSummaryBar';
import { TargetGrid } from './TargetGrid';

interface SelectTargetViewProps {
  configuredTargets: string[];
  onSelectTarget: (id: string) => void;
}

export function SelectTargetView({ configuredTargets, onSelectTarget }: SelectTargetViewProps) {
  return (
    <motion.div {...ANIMATIONS.selectTarget} className={Styles.container}>
      <ConditionBreadcrumb backLabel="RAJOUTER UNE CONDITION" activeLabel="CIBLE" />
      <TargetSummaryBar configuredTargets={configuredTargets} onSelectTarget={onSelectTarget} />
      <div className={Styles.divider} />
      <TargetGrid onSelectTarget={onSelectTarget} />
    </motion.div>
  );
}
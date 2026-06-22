import { motion } from 'framer-motion';
import { STAT_ROW_STYLES as STYLES } from './Team.styles';

interface StatRowProps {
  label: string;
  value: number;
  max: number;
  barColor: string;
  color: string;
}

export function StatRow({ label, value, max, barColor, color }: StatRowProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={STYLES.row}>
      <span className={STYLES.label}>{label}</span>
      <div className={STYLES.track}>
        <motion.div
          className={`${STYLES.fillBase} ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className={`${STYLES.value} ${color}`}>{value}</span>
    </div>
  );
}

import { motion } from 'framer-motion';
import { IconGear } from '../../../assets/icons/IconGear';
import { STYLES } from './AgentCardStyle';

interface AgentCardProps {
  id: number;
  name: string;
  heroClass: string;
  imageSrc: string;
  isDimmed: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function AgentCard({
  name,
  heroClass,
  imageSrc,
  isDimmed,
  onSelect,
  onMouseEnter,
  onMouseLeave
}: AgentCardProps) {
  return (
    <motion.button
      className={STYLES.cardBase}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{
        opacity: isDimmed ? 0.4 : 1,
        scale: isDimmed ? 0.95 : 1,
        filter: isDimmed ? 'grayscale(50%) blur(2px)' : 'grayscale(0%) blur(0px)'
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover="hover"
      initial="rest"
    >
      <motion.div
        className={STYLES.frame}
        variants={{
          rest: { borderColor: 'rgba(51, 65, 85, 0.5)', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
          hover: {
            borderColor: 'rgba(245, 158, 11, 0.6)',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            boxShadow: '0 0 40px rgba(245,158,11,0.15)'
          }
        }}
      />

      <div className={STYLES.imageWrapper}>
        <motion.div
          className={STYLES.glow}
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        />
        <motion.img
          src={imageSrc}
          alt={name}
          className={STYLES.image}
          variants={{
            rest: { scale: 1, y: 0 },
            hover: { scale: 1.05, y: -16 }
          }}
        />
      </div>

      <motion.div
        className={STYLES.badgeWrapper}
        variants={{
          rest: { opacity: 0, y: 20 },
          hover: { opacity: 1, y: 0 }
        }}
      >
        <span className={STYLES.badge}>
          <IconGear className="w-5 h-5" />
          CONFIGURER
        </span>
      </motion.div>

      <motion.div className={STYLES.infoContainer} variants={{ rest: { y: 0 }, hover: { y: -8 } }}>
        <motion.span
          className={STYLES.nameText}
          variants={{ rest: { color: '#cbd5e1' }, hover: { color: '#ffffff' } }}
        >
          {name}
        </motion.span>
        <span className={STYLES.classText}>{heroClass}</span>
      </motion.div>
    </motion.button>
  );
}

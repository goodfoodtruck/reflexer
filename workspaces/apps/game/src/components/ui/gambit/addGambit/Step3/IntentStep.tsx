import { motion } from 'framer-motion';
import type { DraftGambit } from '@components/ui/gambit/GambitTypes';
import { Styles } from './Intent.styles';
import { useIntentStep } from './useIntentStep';
import { CategoryList } from './components/CategoryList';
import { ActionDetailPanel } from './components/ActionDetailPanel';
import { PlaceholderIcon } from '@assets/icons/IconPlaceholder';

const ANIMATION = {
  key: 'step3',
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2 }
} as const;

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function IntentStep({ draft, updateDraft }: Props) {
  const {
    activeCategoryId,
    setActiveCategoryId,
    activeCategory,
    selectedActionDetails,
    selectedActionId,
    handleSelectAction
  } = useIntentStep({ draft, updateDraft });

  return (
    <motion.div {...ANIMATION} className={Styles.container}>
      <div className={Styles.headerBox}>
        <h3 className={Styles.title}>Intention</h3>
        <p className={Styles.subtitle}>Que doit faire l'agent si la situation se présente ?</p>
      </div>

      <div className={Styles.layoutGrid}>
        <CategoryList activeCategoryId={activeCategoryId} onSelect={setActiveCategoryId} />

        <div className={Styles.colItems}>
          {activeCategory?.items.map((action) => (
            <button
              key={action.id}
              onClick={() => handleSelectAction(action.kind, action.id)}
              className={`${Styles.actionCardBase} ${selectedActionId === action.id ? Styles.actionCardActive : ''}`}
            >
              <div className={Styles.actionIconWrapper}>
                {action.image ? (
                  <img src={action.image} alt={action.name} className={Styles.actionIconImg} />
                ) : (
                  <PlaceholderIcon className="w-8 h-8" />
                )}
              </div>
              <span className={Styles.actionName}>{action.name}</span>
            </button>
          ))}
        </div>

        <ActionDetailPanel details={selectedActionDetails} />
      </div>
    </motion.div>
  );
}

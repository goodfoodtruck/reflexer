import type { View } from '../OptionsPanel';
import { STYLES } from '../optionsPanelStyle';

type Props = { view: View; onClose: () => void };

const TITLES: Record<View, string> = {
  main: 'Options',
  reset: 'Changer le mot de passe'
};

export function PanelHeader({ view, onClose }: Props) {
  return (
    <div className={STYLES.header}>
      <span className={STYLES.title}>{TITLES[view]}</span>
      <button onClick={onClose} className={STYLES.closeBtn}>
        ×
      </button>
    </div>
  );
}

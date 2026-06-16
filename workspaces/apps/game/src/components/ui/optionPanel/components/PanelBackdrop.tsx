import { STYLES } from "../optionsPanelStyle";

type Props = { onClose: () => void; children: React.ReactNode };

export function PanelBackdrop({ onClose, children }: Props) {
  return (
    <div className={STYLES.backdrop}>
      <div className={STYLES.overlay} onClick={onClose} />
      <div className={STYLES.panel}>{children}</div>
    </div>
  );
}
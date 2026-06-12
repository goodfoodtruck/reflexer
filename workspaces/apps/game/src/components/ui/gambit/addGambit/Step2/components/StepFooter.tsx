import { Styles } from '../Condition.styles';

interface StepFooterProps {
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}

export function StepFooter({ onCancel, onSave, disabled }: StepFooterProps) {
  return (
    <div className={Styles.footer}>
      <button className={`${Styles.btnBase} ${Styles.btnSec}`} onClick={onCancel}>
        Annuler
      </button>
      <button
        className={`${Styles.btnBase} ${Styles.btnPri}`}
        onClick={onSave}
        disabled={disabled}
      >
        Enregistrer
      </button>
    </div>
  );
}
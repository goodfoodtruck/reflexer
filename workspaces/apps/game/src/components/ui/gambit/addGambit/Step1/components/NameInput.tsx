import { Styles } from "../Situation.styles";

interface NameInputProps {
  value: string;
  maxLength: number;
  isAtMaxChars: boolean;
  charCountLabel: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NameInput({
  value,
  maxLength,
  isAtMaxChars,
  charCountLabel,
  onChange,
}: NameInputProps) {
  const charCount = (isMax: boolean) => isMax ? "text-amber-500" : "text-slate-600";

  return (
    <div>
      <p className={Styles.sectionLabel}>Nom du gambit</p>

      <div className={Styles.inputWrapper}>
        <input
          type="text"
          className={Styles.input}
          placeholder="Nouveau gambit"
          value={value}
          maxLength={maxLength}
          onChange={onChange}
          autoFocus
        />
      </div>

      <div className={Styles.helperRow}>
        <span>Un nom court et lisible aide à repérer le gambit dans la liste.</span>
        <span className={charCount(isAtMaxChars)}>{charCountLabel}</span>
      </div>
    </div>
  );
}
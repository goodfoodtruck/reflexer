type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
};

const styles = {
  label: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1',
  input:
    'w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-all font-bold placeholder-slate-600'
};

export function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoFocus
}: Props) {
  return (
    <div>
      <p className={styles.label}>{label}</p>
      <input
        type={type}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
    </div>
  );
}

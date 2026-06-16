const style =
  'w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed';

type Props = { label: string; loading: boolean; disabled: boolean; onClick: () => void };

export function SubmitButton({ label, loading, disabled, onClick }: Props) {
  return (
    <button onClick={onClick} disabled={disabled || loading} className={style}>
      {loading ? '...' : label}
    </button>
  );
}

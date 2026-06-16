const STYLES = {
  error:
    'text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3',
  success:
    'text-emerald-400 text-xs font-bold text-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3'
};

type Props = { type: 'error' | 'success'; message: string };

export function AlertMessage({ type, message }: Props) {
  return <div className={STYLES[type]}>{message}</div>;
}

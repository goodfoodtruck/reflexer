type Operator = 'AND' | 'OR';

interface Props {
  op: Operator;
  onClick: () => void;
  title?: string;
}

const OPERATOR_STYLES: Record<Operator, string> = {
  AND: 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/25',
  OR:  'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25',
};

const OPERATOR_LABELS: Record<Operator, string> = {
  AND: 'ET',
  OR:  'OU',
};

export function OperatorButton({ op, onClick, title = 'Cliquer pour basculer ET / OU' }: Props) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${OPERATOR_STYLES[op]}`}
    >
      {OPERATOR_LABELS[op]}
    </button>
  );
}

export function StaticOperatorLabel({ op }: { op: Operator }) {
  return (
    <span className={`text-[9px] font-black px-0.5 ${op === 'AND' ? 'text-sky-400' : 'text-amber-400'}`}>
      {OPERATOR_LABELS[op]}
    </span>
  );
}

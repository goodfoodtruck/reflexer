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

function IconSwap() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="w-2.5 h-2.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 5h12M11 2l3 3-3 3M14 11H2M5 8l-3 3 3 3" />
    </svg>
  );
}

export function OperatorButton({ op, onClick, title = 'Cliquer pour basculer ET / OU' }: Props) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all duration-150 ${OPERATOR_STYLES[op]}`}
    >
      <IconSwap />
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

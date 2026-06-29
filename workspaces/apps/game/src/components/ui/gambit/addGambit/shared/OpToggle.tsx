import { Styles_conditionStack } from './blockStack.styles';

function IconSwitch() {
  return (
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 5h12M11 2l3 3-3 3M14 11H2M5 8l-3 3 3 3" />
    </svg>
  );
}

interface OpToggleProps {
  op: 'AND' | 'OR';
  onClick: () => void;
}

export function OpToggle({ op, onClick }: OpToggleProps) {
  return (
    <button
      className={`${Styles_conditionStack.stackOperatorBtn} flex items-center gap-1 ${
        op === 'OR' ? Styles_conditionStack.stackOperatorOr : Styles_conditionStack.stackOperatorAnd
      }`}
      onClick={onClick}
      title="Basculer ET / OU"
    >
      <IconSwitch />
      {op === 'AND' ? 'ET' : 'OU'}
    </button>
  );
}

import type { AnyFilter, ConditionGroup } from '@reflexer/engine';
import { filterToLabel } from './display';
import { Styles_gambit_row } from './Gambit.styles';

/* ─── Engine node type narrowing ─────────────────────────────────────── */

type ExistsNode = Extract<ConditionGroup, { type: 'EXISTS' }>;
type GroupNode  = Extract<ConditionGroup, { operator: 'AND' | 'OR' }>;
type NotNode    = Extract<ConditionGroup, { operator: 'NOT' }>;

/* ─── Shared prop shape for positioned nodes ────────────────────────── */

type NodeProps<T extends ConditionGroup = ConditionGroup> = {
  node: T;
  index: number;
  parentOp?: string;
};

/* ─── LogicConnector ─────────────────────────────────────────────────── */

function LogicConnector({ op }: { op: string }) {
  const isAnd = op === 'AND';
  return (
    <div className={Styles_gambit_row.logicConnectorArea}>
      <div className={Styles_gambit_row.logicConnectorLine} />
      <span className={isAnd ? Styles_gambit_row.opBadgeAnd : Styles_gambit_row.opBadgeOr}>
        {isAnd ? 'ET' : 'OU'}
      </span>
    </div>
  );
}

/* ─── ExistsContextDisplay — partagé avec GambitRow (section Cibler) ── */

const SCOPE_LABELS: Record<string, string> = {
  SELF: 'MOI-MÊME',
  ENEMY: 'ENNEMI',
  ALLY: 'ALLIÉ',
};

function scopeBadgeColor(targetType: string): string {
  if (targetType === 'SELF')  return Styles_gambit_row.conditionSelf;
  if (targetType === 'ENEMY') return Styles_gambit_row.conditionEnemy;
  return Styles_gambit_row.conditionCharacter;
}

export function ExistsContextDisplay({
  targetType,
  filters,
}: {
  targetType: string;
  filters: readonly AnyFilter[];
}) {
  return (
    <div className={Styles_gambit_row.conditionBox}>
      <span className={`${Styles_gambit_row.conditionBadgeBase} ${scopeBadgeColor(targetType)}`}>
        {SCOPE_LABELS[targetType] ?? targetType}
      </span>
      {filters.map((filter, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className={Styles_gambit_row.opBadgeAnd}>ET</span>}
          <span className={Styles_gambit_row.filterText}>{filterToLabel(filter)}</span>
        </span>
      ))}
    </div>
  );
}

/* ─── ExistsCard — leaf node rendering ──────────────────────────────── */

function ExistsCard({ node, index, parentOp }: NodeProps<ExistsNode>) {
  return (
    <div className="flex flex-col gap-2">
      {parentOp && index > 0 && <LogicConnector op={parentOp} />}
      <ExistsContextDisplay targetType={node.context.targetType} filters={node.context.filters} />
    </div>
  );
}

/* ─── GroupCard — AND/OR group with visual boundary ─────────────────── */

function GroupCard({ node, index, parentOp }: NodeProps<GroupNode>) {
  const groupStyle =
    node.operator === 'OR'
      ? Styles_gambit_row.conditionGroupOr
      : Styles_gambit_row.conditionGroupAnd;

  return (
    <div className="flex flex-col gap-2">
      {parentOp && index > 0 && <LogicConnector op={parentOp} />}
      <div className={groupStyle}>
        {node.conditions.map((child, i) => (
          <ConditionNodeRenderer key={i} node={child} index={i} parentOp={node.operator} />
        ))}
      </div>
    </div>
  );
}

/* ─── NotCard — NOT wrapper ──────────────────────────────────────────── */

function NotCard({ node, index, parentOp }: NodeProps<NotNode>) {
  return (
    <div className={Styles_gambit_row.notContainer}>
      {parentOp && index > 0 && <LogicConnector op={parentOp} />}
      <div className={Styles_gambit_row.notBox}>
        <span className={Styles_gambit_row.notBadge}>NON</span>
        <div className="pr-1">
          <ConditionNodeRenderer node={node.condition} index={0} />
        </div>
      </div>
    </div>
  );
}

/* ─── Dispatcher — single responsibility: route by node type ─────────── */

function ConditionNodeRenderer({ node, index = 0, parentOp }: NodeProps) {
  if ('type' in node && node.type === 'EXISTS')
    return <ExistsCard node={node} index={index} parentOp={parentOp} />;
  if ('operator' in node && (node.operator === 'AND' || node.operator === 'OR'))
    return <GroupCard node={node} index={index} parentOp={parentOp} />;
  if ('operator' in node && node.operator === 'NOT')
    return <NotCard node={node} index={index} parentOp={parentOp} />;
  return null;
}

/* ─── Public API ─────────────────────────────────────────────────────── */

// eslint-disable-next-line react-refresh/only-export-components
export function renderConditionNode(node: ConditionGroup): React.ReactNode {
  return <ConditionNodeRenderer node={node} index={0} />;
}

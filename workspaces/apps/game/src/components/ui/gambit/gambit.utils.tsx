/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GambitCondition, GambitFilter, DraftCondition, RealGambit  } from './GambitTypes';
import { Styles_gambit_row } from './Gambit.styles';

export function renderFilterText(filter?: GambitFilter): string | null {
  if (!filter) return null;
  switch (filter.type) {
    case 'HP_BELOW':          return `PV < ${filter.threshold}%`;
    case 'HP_ABOVE':          return `PV > ${filter.threshold}%`;
    case 'IN_RANGE':          return `À portée ${filter.range}`;
    case 'HAS_STATUS':        return `Statut : ${filter.status}`;
    case 'IS_TRAP':           return `Est un piège`;
    case 'IS_ATTACKING_ALLY': return `Attaque un allié`;
    default:                  return filter.status ?? filter.type;
  }
}

export function renderConditionNode(
  node: GambitCondition,
  index: number = 0,
  parentOp?: string
): React.ReactNode {
  if ('type' in node && node.type === 'EXISTS') {
    const { kind } = node.scope;
    const filterStr = renderFilterText(node.scope.filter);
    const badgeColor =
      kind === 'SELF'    ? Styles_gambit_row.conditionSelf
      : kind === 'ENEMY' ? Styles_gambit_row.conditionEnemy
      :                    Styles_gambit_row.conditionCharacter;

    return (
      <div key={`${node.type}-${index}`} className="flex flex-col gap-2">
        {parentOp && index > 0 && (
          <div className={Styles_gambit_row.logicConnectorArea}>
            <div className={Styles_gambit_row.logicConnectorLine} />
            <span className={Styles_gambit_row.logicConnectorText}>
              {parentOp === 'AND' ? 'ET' : 'OU'}
            </span>
          </div>
        )}
        <div className={Styles_gambit_row.conditionBox}>
          <span className={`${Styles_gambit_row.conditionBadgeBase} ${badgeColor}`}>{kind}</span>
          {filterStr && <span className={Styles_gambit_row.filterText}>{filterStr}</span>}
        </div>
      </div>
    );
  }

  if ('operator' in node && (node.operator === 'AND' || node.operator === 'OR')) {
    return (
      <div key={`group-${index}`} className="flex flex-col">
        {node.conditions.map((child, i) => renderConditionNode(child, i, node.operator))}
      </div>
    );
  }

  if ('operator' in node && node.operator === 'NOT') {
    return (
      <div key={`not-${index}`} className={Styles_gambit_row.notContainer}>
        {parentOp && index > 0 && (
          <div className={Styles_gambit_row.logicConnectorArea}>
            <div className={Styles_gambit_row.logicConnectorLine} />
            <span className={Styles_gambit_row.logicConnectorText}>
              {parentOp === 'AND' ? 'ET' : 'OU'}
            </span>
          </div>
        )}
        <div className={Styles_gambit_row.notBox}>
          <span className={Styles_gambit_row.notBadge}>NON</span>
          <div className="pr-1">{renderConditionNode(node.condition, 0)}</div>
        </div>
      </div>
    );
  }

  return null;
}


export function extractDraftConditions(cond: any): DraftCondition[] {
  if (!cond) return [];

  if (cond.type === 'EXISTS') {
    return [{
      id: `loaded-${Math.random().toString(36).substr(2, 9)}`,
      scopeKind: cond.scope?.kind || 'ENEMY',
      filterType: cond.scope?.filter?.type || '',
      value:
        cond.scope?.filter?.threshold ??
        cond.scope?.filter?.range ??
        cond.scope?.filter?.status ??
        '',
    }];
  }

  if (cond.operator === 'NOT' && cond.condition) {
    return extractDraftConditions(cond.condition);
  }

  if ((cond.operator === 'AND' || cond.operator === 'OR') && Array.isArray(cond.conditions)) {
    return cond.conditions.flatMap(extractDraftConditions);
  }

  return [];
}

export function buildInitialDraft(initialGambit?: RealGambit) {
  if (!initialGambit) {
    return {
      name: '',
      operator: 'AND' as const,
      conditions: [],
      intentKind: 'ACTION' as const,
      intentValue: '',
      targetKind: 'ENEMY' as const,
      targetSort: '',
      targetFilters: [],
    };
  }

  return {
    name: initialGambit.name,
    operator: (initialGambit.conditions as any).operator || 'AND',
    conditions: extractDraftConditions(initialGambit.conditions),
    intentKind: initialGambit.intent.kind,
    intentValue:
      initialGambit.intent.kind === 'MOVEMENT'
        ? initialGambit.intent.strategy || ''
        : initialGambit.intent.action?.id || '',
    targetKind: initialGambit.targetSelector.context.kind as any,
    targetSort: initialGambit.targetSelector.sort || 'NEAREST',
    targetFilters: (initialGambit.targetSelector.context.filters || []).map((f: any) => ({
      categoryId: f.type,
      values: f.status ? f.status.split(',') : [],
    })),
  };
}
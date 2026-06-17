import type { AnyFilter, ConditionGroup, Gambit } from '@reflexer/engine';
import type { DraftCondition, DraftGambit } from './GambitTypes';
import { conditionsToDraft, passiveIdToStatusLabel, rangeToLabel, targetFiltersToDraft } from './gambit.adapter';
import { Styles_gambit_row } from './Gambit.styles';

export function renderFilterText(filter?: AnyFilter): string | null {
  if (!filter) return null;
  switch (filter.type) {
    case 'HP_BELOW':           return `PV < ${filter.threshold}%`;
    case 'HP_ABOVE':           return `PV > ${filter.threshold}%`;
    case 'IN_RANGE':           return rangeToLabel(filter.range);
    case 'HAS_PASSIVE':        return `Statut : ${passiveIdToStatusLabel(filter.passiveId)}`;
    case 'IS_ATTACKING_ALLY':  return `Attaque un allié`;
    case 'IS_ATTACKING_SELF':  return `M'attaque`;
    default:                   return filter.type;
  }
}

export function renderConditionNode(
  node: ConditionGroup,
  index: number = 0,
  parentOp?: string
): React.ReactNode {
  if ('type' in node && node.type === 'EXISTS') {
    const { targetType, filters } = node.context;
    const badgeColor =
      targetType === 'SELF'    ? Styles_gambit_row.conditionSelf
      : targetType === 'ENEMY' ? Styles_gambit_row.conditionEnemy
      :                          Styles_gambit_row.conditionCharacter;

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
          <span className={`${Styles_gambit_row.conditionBadgeBase} ${badgeColor}`}>{targetType}</span>
          {filters.map((filter, i) => {
            const filterStr = renderFilterText(filter);
            return filterStr && (
              <span key={i} className={Styles_gambit_row.filterText}>{filterStr}</span>
            );
          })}
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


export function extractDraftConditions(cond: ConditionGroup): DraftCondition[] {
  return conditionsToDraft(cond);
}

export function buildInitialDraft(initialGambit?: Gambit): DraftGambit {
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

  const conditions = initialGambit.conditions;
  const operator =
    'operator' in conditions && (conditions.operator === 'AND' || conditions.operator === 'OR')
      ? conditions.operator
      : 'AND';

  return {
    name: initialGambit.name,
    operator,
    conditions: extractDraftConditions(conditions),
    intentKind: initialGambit.intent.kind,
    intentValue:
      initialGambit.intent.kind === 'MOVEMENT'
        ? initialGambit.intent.strategy || ''
        : initialGambit.intent.actionId || '',
    targetKind: initialGambit.targetSelector.context.targetType,
    targetSort: initialGambit.targetSelector.sort || 'NEAREST',
    targetFilters: targetFiltersToDraft(initialGambit.targetSelector),
  };
}

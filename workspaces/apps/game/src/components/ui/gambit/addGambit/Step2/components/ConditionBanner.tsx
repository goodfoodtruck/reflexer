import { Fragment } from 'react';
import {
  getCategory,
  formatBlockValue,
  type CategoryId,
  type FilterEntry,
} from '@components/ui/gambit/filters/filterRegistry';
import type { ConditionBlock } from '@components/ui/gambit/GambitTypes';
import { Styles } from '@components/ui/gambit/addGambit/Step2/Condition.styles';
import { computeAndGroups, buildPendingBlocks } from '@components/ui/gambit/addGambit/Step2/utils/bannerFormatters';

const SCOPE_LABELS: Record<string, string> = {
  SELF:  'Moi-même',
  ENEMY: 'Ennemi',
  ALLY:  'Allié',
  OTHER: 'Autre',
};

interface ConditionBannerProps {
  activeTarget: string | null;
  blocks: ConditionBlock[];
  blockOperators: ('AND' | 'OR')[];
  pendingEntries: FilterEntry[];
  pendingValuesOperators: Record<string, 'AND' | 'OR'>;
  pendingGroupOperator?: 'AND' | 'OR';
}

function OpConnector({ op }: { op: 'AND' | 'OR' }) {
  return (
    <span
      className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${
        op === 'AND'
          ? 'text-slate-400 border-slate-700/50'
          : 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      }`}
    >
      {op === 'AND' ? 'ET' : 'OU'}
    </span>
  );
}

function Paren({ ch }: { ch: '(' | ')' }) {
  return (
    <span className="text-slate-500 font-black text-sm leading-none select-none">{ch}</span>
  );
}

function BlockChip({ block, isDraft = false }: { block: ConditionBlock; isDraft?: boolean }) {
  const cat = getCategory(block.categoryId);
  const vop = block.valuesOperator ?? 'OR';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0 ${
        isDraft
          ? 'border border-dashed border-slate-600/80 text-slate-400 bg-transparent'
          : 'border border-slate-700/80 text-slate-200 bg-[#1a1f2e]'
      }`}
    >
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 shrink-0">
        {cat.label}
      </span>
      <span className="text-slate-700 mx-0.5">·</span>
      {block.values.map((v, vi) => (
        <Fragment key={vi}>
          {vi > 0 && (
            <span className={`font-black text-[9px] px-0.5 ${vop === 'AND' ? 'text-sky-400' : 'text-amber-400'}`}>
              {vop === 'AND' ? 'ET' : 'OU'}
            </span>
          )}
          <span>{formatBlockValue(block.categoryId as CategoryId, v)}</span>
        </Fragment>
      ))}
      {isDraft && <span className="text-slate-600 ml-0.5">…</span>}
    </span>
  );
}

function renderConfirmedBlocks(blocks: ConditionBlock[], blockOperators: ('AND' | 'OR')[]): React.ReactNode {
  if (blocks.length === 0) return null;
  if (blocks.length === 1) return <BlockChip block={blocks[0]!} />;

  const interOps = blockOperators.slice(0, blocks.length - 1);
  const hasMixed = interOps.some((op) => op !== interOps[0]);

  if (!hasMixed) {
    return blocks.map((block, i) => (
      <Fragment key={i}>
        {i > 0 && <OpConnector op={blockOperators[i - 1] ?? 'AND'} />}
        <BlockChip block={block} />
      </Fragment>
    ));
  }

  const andGroups = computeAndGroups(blocks, interOps);
  return andGroups.map((group, gi) => (
    <Fragment key={gi}>
      {gi > 0 && <OpConnector op="OR" />}
      {group.length > 1 ? (
        <span className="inline-flex items-center gap-1">
          <Paren ch="(" />
          {group.map((block, bi) => (
            <Fragment key={bi}>
              {bi > 0 && <OpConnector op="AND" />}
              <BlockChip block={block} />
            </Fragment>
          ))}
          <Paren ch=")" />
        </span>
      ) : (
        <BlockChip block={group[0]!} />
      )}
    </Fragment>
  ));
}

export function ConditionBanner({
  activeTarget,
  blocks,
  blockOperators,
  pendingEntries,
  pendingValuesOperators,
  pendingGroupOperator = 'OR',
}: ConditionBannerProps) {
  const scopeLabel = SCOPE_LABELS[activeTarget ?? ''] ?? activeTarget ?? '';
  const pendingBlocks = buildPendingBlocks(pendingEntries, pendingValuesOperators);
  const hasContent = blocks.length > 0 || pendingBlocks.length > 0;

  return (
    <div className={Styles.banner}>
      <div className={Styles.bannerGlow} />
      <div className="relative z-10 flex items-center gap-2 flex-wrap min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
          {scopeLabel}
        </span>

        {!hasContent && (
          <span className="text-slate-500 text-[10px] italic">Sélectionnez un critère…</span>
        )}

        {renderConfirmedBlocks(blocks, blockOperators)}

        {pendingBlocks.length > 0 && (
          <>
            {blocks.length > 0 && <OpConnector op={blockOperators[blocks.length - 1] ?? 'AND'} />}
            {pendingBlocks.length > 1 ? (
              <span className="inline-flex items-center gap-1">
                <Paren ch="(" />
                {pendingBlocks.map((pb, i) => (
                  <Fragment key={`pending-${i}`}>
                    {i > 0 && <OpConnector op={pendingGroupOperator} />}
                    <BlockChip block={pb} isDraft />
                  </Fragment>
                ))}
                <Paren ch=")" />
              </span>
            ) : (
              <BlockChip block={pendingBlocks[0]!} isDraft />
            )}
          </>
        )}
      </div>
    </div>
  );
}

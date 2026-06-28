import { Fragment } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { DragIcon } from '@assets/icons/IconDrag';
import { ChevronIcon } from '@assets/icons/IconChevron';
import { IconEdit } from '@assets/icons/IconEdit';
import { IconTrash } from '@assets/icons/IconTrash';
import type { StoredGambit } from '@services/gambit.service';
import type { DraftCondition } from './GambitTypes';
import { conditionsToDraft, sortToFullLabel, targetSelectorToConditionGroup } from './gambit.adapter';
import { formatBlockValue } from './filters/filterRegistry';
import { ACTION_CATEGORIES } from './actionCatalog';
import type { ActionItem } from './GambitTypes';

/* ── Constants ─────────────────────────────────────────────────────────── */

const SCOPE_LABEL: Record<string, string> = {
  SELF:  'Moi-même',
  ALLY:  'Allié',
  ENEMY: 'Ennemi',
};

const SCOPE_COLOR: Record<string, string> = {
  SELF:  'bg-sky-500/15 text-sky-300 border-sky-500/25',
  ALLY:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  ENEMY: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
};

const SCOPE_ACCENT: Record<string, string> = {
  SELF:  'border-l-sky-500/50',
  ALLY:  'border-l-emerald-500/50',
  ENEMY: 'border-l-rose-500/50',
};

const STRATEGY_LABELS: Record<string, string> = {
  APPROACH: 'Chargez !',
  FLEE:     'Fuite',
  STAY:     'Tenir la position',
};

/* ── Data helpers ───────────────────────────────────────────────────────── */

function resolveAction(intent: StoredGambit['intent']): ActionItem | undefined {
  if (intent.kind !== 'ACTION') return undefined;
  for (const cat of ACTION_CATEGORIES) {
    const found = cat.items.find((item) => item.id === intent.actionId);
    if (found) return found;
  }
  return undefined;
}

function intentLabel(intent: StoredGambit['intent']): string {
  if (intent.kind === 'MOVEMENT') return STRATEGY_LABELS[intent.strategy] ?? intent.strategy;
  return resolveAction(intent)?.name ?? intent.actionId;
}

function extractRootOp(gambit: StoredGambit): 'AND' | 'OR' {
  const cond = gambit.conditions;
  if ('operator' in cond && (cond.operator === 'AND' || cond.operator === 'OR')) return cond.operator;
  return 'AND';
}

/* ── Shared display primitives ──────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
      {children}
    </span>
  );
}

function Divider() {
  return <div className="h-px bg-slate-800/80" />;
}

function OpBadge({ op }: { op: 'AND' | 'OR' }) {
  return (
    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
      op === 'AND'
        ? 'border-slate-700 text-slate-500'
        : 'border-amber-500/30 text-amber-400 bg-amber-500/8'
    }`}>
      {op === 'AND' ? 'ET' : 'OU'}
    </span>
  );
}

function OpDivider({ op }: { op: 'AND' | 'OR' }) {
  return (
    <div className="flex items-center gap-2 my-0.5">
      <div className="h-px flex-1 bg-slate-800/60" />
      <OpBadge op={op} />
      <div className="h-px flex-1 bg-slate-800/60" />
    </div>
  );
}

function ConditionLine({ cond, showScope = true }: { cond: DraftCondition; showScope?: boolean }) {
  const scopeColor = SCOPE_COLOR[cond.scopeKind] ?? SCOPE_COLOR.SELF;
  const scopeAccent = SCOPE_ACCENT[cond.scopeKind] ?? 'border-l-rose-500/50';
  const vop = cond.valuesOperator ?? 'OR';

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#0D0F14] border border-slate-800/50 border-l-2 ${scopeAccent}`}>
      {showScope && (
        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${scopeColor}`}>
          {SCOPE_LABEL[cond.scopeKind]}
        </span>
      )}
      {cond.negated && (
        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-rose-500/40 bg-rose-500/10 text-rose-400 shrink-0">
          NON
        </span>
      )}
      <span className={`text-xs font-semibold ${cond.negated ? 'text-slate-400 line-through decoration-rose-500/50' : 'text-slate-200'}`}>
        {cond.blockValues.map((v, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className={`text-[9px] font-black mx-1 ${vop === 'AND' ? 'text-sky-400' : 'text-amber-400'}`}>
                {vop === 'AND' ? 'ET' : 'OU'}
              </span>
            )}
            {formatBlockValue(cond.filterTypeCategory, v)}
          </Fragment>
        ))}
      </span>
    </div>
  );
}

/* ── Expanded detail panel ──────────────────────────────────────────────── */

function GambitDetails({ gambit }: { gambit: StoredGambit }) {
  const conditions = conditionsToDraft(gambit.conditions);
  const globalOp = extractRootOp(gambit);

  const targetType = gambit.targetSelector.context.targetType as string;
  const targetSort = gambit.targetSelector.sort;
  const targetFilters = conditionsToDraft(targetSelectorToConditionGroup(gambit.targetSelector));

  const action = resolveAction(gambit.intent);
  const targetColor = SCOPE_COLOR[targetType] ?? SCOPE_COLOR.ENEMY;

  const condsByScope = conditions.reduce<Map<string, DraftCondition[]>>((acc, c) => {
    const list = acc.get(c.scopeKind) ?? [];
    list.push(c);
    acc.set(c.scopeKind, list);
    return acc;
  }, new Map());
  const scopeGroups = Array.from(condsByScope.entries());

  return (
    <div className="mx-4 mb-4 mt-1 rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden">

      {/* ── Déclenchement ── */}
      <div className="flex flex-col gap-3 px-5 py-4">
        <SectionLabel>Déclenchement</SectionLabel>

        {conditions.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Toujours actif — aucune condition définie.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {scopeGroups.map(([scope, conds], gi) => (
              <Fragment key={scope}>
                {gi > 0 && <OpDivider op={globalOp} />}
                <div className="flex flex-col gap-2">
                  {conds.map((cond, ci) => (
                    <Fragment key={cond.id}>
                      {ci > 0 && <OpDivider op={conds[ci - 1]!.scopeOperator ?? 'AND'} />}
                      <ConditionLine cond={cond} />
                    </Fragment>
                  ))}
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* ── Action ── */}
      <div className="flex flex-col gap-3 px-5 py-4">
        <SectionLabel>Action</SectionLabel>

        {gambit.intent.kind === 'MOVEMENT' ? (
          <p className="text-xs font-semibold text-slate-200">
            {STRATEGY_LABELS[gambit.intent.strategy] ?? gambit.intent.strategy}
          </p>
        ) : action ? (
          <div className="flex items-center gap-3">
            {action.image && (
              <img
                src={action.image}
                alt=""
                className="w-10 h-10 rounded-lg object-contain bg-slate-900 border border-slate-800 p-1 shrink-0"
              />
            )}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-bold text-slate-100">{action.name}</span>
              {action.cost !== undefined && (
                <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {action.cost} ⚡
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Aucune action.</p>
        )}
      </div>

      <Divider />

      {/* ── Cible ── */}
      <div className="flex flex-col gap-3 px-5 py-4">
        <SectionLabel>Cible</SectionLabel>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${targetColor}`}>
              {SCOPE_LABEL[targetType] ?? targetType}
            </span>
            {targetSort && targetType !== 'SELF' && (
              <span className="text-xs font-semibold text-slate-300">
                {sortToFullLabel(targetSort)}
              </span>
            )}
          </div>

          {targetFilters.length > 0 && (
            <div className="flex flex-col gap-2">
              {targetFilters.map((cond, ci) => (
                <Fragment key={cond.id}>
                  {ci > 0 && <OpDivider op={targetFilters[ci - 1]!.scopeOperator ?? 'AND'} />}
                  <ConditionLine cond={cond} showScope={false} />
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ── Main GambitRow ─────────────────────────────────────────────────────── */

interface GambitRowProps {
  gambit: StoredGambit;
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GambitRow({ gambit, isOpen, onToggle, onEdit, onDelete }: GambitRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gambit._id,
    transition: { duration: 150, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  });

  const containerStyle = isDragging
    ? 'bg-[#11131A] border-amber-500 shadow-xl z-50'
    : isOpen
      ? 'bg-[#11131A] border-[#2A2E39] shadow-lg'
      : 'bg-[#11131A] border-transparent hover:border-[#2A2E39]';

  const targetType = gambit.targetSelector.context.targetType as string;
  const targetColor = SCOPE_COLOR[targetType] ?? SCOPE_COLOR.ENEMY;
  const action = resolveAction(gambit.intent);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group relative flex flex-col rounded-xl border transition-all duration-200 ${containerStyle}`}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-3 px-4 py-3.5 relative z-10">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-600 hover:text-amber-500 cursor-grab active:cursor-grabbing focus-visible:outline-none shrink-0"
        >
          <DragIcon className="w-5 h-5" />
        </button>

        <div className="w-7 h-7 rounded bg-[#0A0C10] border border-[#2A2E39] flex-none flex items-center justify-center text-amber-500 font-black text-xs">
          {gambit.priority.toString().padStart(2, '0')}
        </div>

        <div
          className="flex-1 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none min-w-0"
          onClick={onToggle}
        >
          {/* Left: name + action subtitle */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-slate-200 font-bold tracking-widest uppercase text-sm group-hover:text-white transition-colors truncate">
              {gambit.name}
            </span>
            <div className="flex items-center gap-1.5">
              {action?.image ? (
                <img
                  src={action.image}
                  alt=""
                  className="w-3.5 h-3.5 rounded object-contain opacity-60 shrink-0"
                />
              ) : (
                <span className="text-[9px] text-slate-600 shrink-0">
                  {gambit.intent.kind === 'MOVEMENT' ? '🏃' : '⚔'}
                </span>
              )}
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase truncate">
                {intentLabel(gambit.intent)}
              </span>
            </div>
          </div>

          {/* Right: target badge + controls */}
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${targetColor}`}>
              {SCOPE_LABEL[targetType] ?? targetType}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors"
                title="Modifier cette règle"
              >
                <IconEdit />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                title="Supprimer cette règle"
              >
                <IconTrash />
              </button>
            </div>

            <ChevronIcon className={`w-5 h-5 text-slate-600 transition-transform duration-300 group-hover:text-amber-500 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <GambitDetails gambit={gambit} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

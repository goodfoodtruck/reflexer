import React, { useState, useEffect } from 'react';
import { gameStore } from '@infra/bridge/GameStore';
import { useGameStore } from '@infra/react/hooks/useGameStore';
import { type AutomationRule } from '@domain/shared/types';
import {
  TARGET_CONFIG,
  type TargetKind,
  type TargetFilterValue,
  type TargetKindConfig,
} from '@domain/shared/targetConfig';

// ─── Types locaux ───────────────────────────────────────────────

interface TargetFilter {
  id: string;
  categoryId: string;
  value: TargetFilterValue;
}

interface TargetBlock {
  id: string;
  targetKind: TargetKind;
  filters: TargetFilter[];
}

function uid() { return Math.random().toString(36).slice(2, 8); }

function blockLabel(block: TargetBlock): string {
  const cfg = TARGET_CONFIG.find(c => c.kind === block.targetKind);
  if (!cfg) return '???';
  if (block.filters.length === 0) return cfg.kindLabel;
  return block.filters.map(f => f.value.label).join(' ET ');
}

function summaryText(blocks: TargetBlock[]): string {
  if (blocks.length === 0) return '—';
  return blocks.map(b => blockLabel(b)).join(' OU ');
}

function blocksFromRule(rule: AutomationRule): TargetBlock[] {
  if (!rule.target?.blocks?.length) return [];
  return rule.target.blocks.map((b: any) => ({
    id: uid(),
    targetKind: b.targetKind,
    filters: (b.filters ?? []).map((f: any) => ({ id: uid(), categoryId: f.categoryId, value: f.value })),
  }));
}

// ─── KindIcon ────────────────────────────────────────────────────

function KindIcon({ kind, size = 48 }: { kind: TargetKind; size?: number }) {
  const s = { width: size, height: size };
  const icons: Record<TargetKind, React.ReactNode> = {
    enemy: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 3L2 20h20L12 3z"/>
        <line x1="12" y1="10" x2="12" y2="15"/>
        <circle cx="12" cy="17.5" r="1" fill="currentColor"/>
      </svg>
    ),
    ally: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="8" cy="8" r="3"/>
        <circle cx="16" cy="8" r="3"/>
        <path d="M2 20c0-3 2.5-5 6-5s6 2 6 5"/>
        <path d="M16 15c3.5 0 6 2 6 5"/>
      </svg>
    ),
    self: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  };
  return <>{icons[kind]}</>;
}

// ─── BlockThumb ──────────────────────────────────────────────────

function BlockThumb({ block, isActive, onClick }: {
  block: TargetBlock | null; isActive: boolean; onClick: () => void;
}) {
  const cfg = block ? TARGET_CONFIG.find(c => c.kind === block.targetKind) : null;
  return (
    <button onClick={onClick} style={{ ...S.thumb, ...(isActive ? S.thumbActive : {}), ...(block === null ? S.thumbAdd : {}) }}>
      {block === null ? (
        <span style={{ fontSize: '22px', color: '#059669' }}>+</span>
      ) : (
        <>
          <div style={{ color: isActive ? '#fff' : '#059669' }}>
            <KindIcon kind={block.targetKind} size={24} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: isActive ? '#fff' : '#064e3b' }}>
            {cfg?.kindLabel}
          </span>
          <span style={{ fontSize: '9px', color: isActive ? '#a7f3d0' : '#065f46', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
            {block.filters.length > 0 ? block.filters.map(f => f.value.label).join('\n+ ') : '—'}
          </span>
        </>
      )}
    </button>
  );
}

// ─── KindSelector ────────────────────────────────────────────────

function KindSelector({ onSelect }: { onSelect: (kind: TargetKind) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div style={S.kindGrid}>
      {TARGET_CONFIG.map(cfg => (
        <button key={cfg.kind}
          style={{ ...S.kindCard, ...(hovered === cfg.kind ? S.kindCardHover : {}) }}
          onMouseEnter={() => setHovered(cfg.kind)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onSelect(cfg.kind)}
        >
          <div style={S.kindImg}><KindIcon kind={cfg.kind} size={52} /></div>
          <span style={S.kindLabel}>{cfg.kindLabel}</span>
        </button>
      ))}
    </div>
  );
}

// ─── FilterSelector ──────────────────────────────────────────────

function FilterSelector({ kind, onSelect, selectedIds }: {
  kind: TargetKind;
  onSelect: (categoryId: string, value: TargetFilterValue) => void;
  selectedIds: string[];
}) {
  const cfg = TARGET_CONFIG.find(c => c.kind === kind)!;
  const [selectedCat, setSelectedCat] = useState(cfg.categories[0]?.id ?? '');

  useEffect(() => { setSelectedCat(cfg.categories[0]?.id ?? ''); }, [kind]);

  const values = cfg.valuesByCategory[selectedCat] ?? [];

  return (
    <div style={S.cvs}>
      <div style={S.cvsCol}>
        {cfg.categories.map(cat => (
          <button key={cat.id}
            style={{ ...S.cvsItem, ...(selectedCat === cat.id ? S.cvsItemActive : {}) }}
            onClick={() => setSelectedCat(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div style={S.cvsArrow}>{'>>'}</div>
      <div style={S.cvsCol}>
        {values.map(v => {
          const already = selectedIds.includes(v.id);
          return (
            <button key={v.id}
              style={{ ...S.cvsItem, ...(already ? S.cvsItemSelected : {}) }}
              onClick={() => !already && onSelect(selectedCat, v)}
              disabled={already}
            >
              {already && <span style={{ marginRight: '6px', fontSize: '10px' }}>✓</span>}
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── GambitSummary ───────────────────────────────────────────────

function GambitSummary({ blocks, rule }: { blocks: TargetBlock[]; rule: AutomationRule | null }) {
  const condText = rule
    ? (rule.conditions.length > 0
        ? rule.conditions.map((b: any) => b.conditions.map((c: any) => c.value.label).join(' ET ')).join(' OU ')
        : '—')
    : '—';
  return (
    <div style={S.summary}>
      <div style={S.summaryTitle}>Résumé du gambit</div>
      <div style={S.summaryRow}>
        <span style={S.summaryTag}>SI</span>
        <span style={{ ...S.summaryText, opacity: 0.5 }}>{condText}</span>
      </div>
      <div style={S.summaryRow}>
        <span style={S.summaryTag}>→</span>
        <span style={{ ...S.summaryText, opacity: 0.5 }}>{rule?.action.type ?? '—'}</span>
      </div>
      <div style={S.summaryRow}>
        <span style={S.summaryTag}>⊕</span>
        <span style={S.summaryText}>{summaryText(blocks) || '— (à définir)'}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════

export function GambitTargetEditor(): React.ReactElement {
  const store = useGameStore();
  const heroIdx      = store.editingHeroIndex ?? 0;
  const hero         = gameStore.playerParty[heroIdx] ?? null;
  const existingRule = hero?.automations.find(r => r.id === store.editingRuleId) ?? null;

  const [blocks, setBlocks]               = useState<TargetBlock[]>([]);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);
  const [step, setStep]                   = useState<'kind' | 'filters'>('kind');
  const [addingMore, setAddingMore]       = useState(false);

  useEffect(() => {
    if (existingRule) {
      const restored = blocksFromRule(existingRule);
      if (restored.length > 0) {
        setBlocks(restored);
        setActiveBlockIdx(0);
        setStep('filters');
      } else {
        setBlocks([]);
        setActiveBlockIdx(0);
        setStep('kind');
      }
    } else {
      setBlocks([]);
      setActiveBlockIdx(0);
      setStep('kind');
    }
    setAddingMore(false);
  }, [store.editingRuleId]);

  const activeBlock  = blocks[activeBlockIdx] ?? null;
  const selectedIds  = activeBlock?.filters.map(f => f.value.id) ?? [];
  const isSelfKind   = activeBlock?.targetKind === 'self';

  // ─── Handlers ─────────────────────────────────────────────────

  const handleSelectKind = (kind: TargetKind) => {
    const newBlock: TargetBlock = { id: uid(), targetKind: kind, filters: [] };
    const updated = [...blocks];
    if (activeBlockIdx >= updated.length) updated.push(newBlock);
    else updated[activeBlockIdx] = newBlock;
    setBlocks(updated);
    setAddingMore(false);
    setStep('filters');
  };

  const handleSelectFilter = (categoryId: string, value: TargetFilterValue) => {
    if (!activeBlock) return;
    const filter: TargetFilter = { id: uid(), categoryId, value };
    const updatedBlock = { ...activeBlock, filters: [...activeBlock.filters, filter] };
    const updated = [...blocks];
    updated[activeBlockIdx] = updatedBlock;
    setBlocks(updated);
    setAddingMore(false);
  };

  const handleDeleteFilter = (filterId: string) => {
    if (!activeBlock) return;
    const updatedBlock = { ...activeBlock, filters: activeBlock.filters.filter(f => f.id !== filterId) };
    const updated = [...blocks];
    updated[activeBlockIdx] = updatedBlock;
    setBlocks(updated);
  };

  const handleAddBlock = () => {
    setActiveBlockIdx(blocks.length);
    setAddingMore(false);
    setStep('kind');
  };

  const handleBack = () => {
    if (addingMore) { setAddingMore(false); return; }
    if (step === 'filters') { setStep('kind'); return; }
    gameStore.clearEditing();
    gameStore.goToScreen('party-setup');
  };

  const handleConfirm = () => {
    if (!hero || blocks.length === 0 || !existingRule) return;
    const party = [...store.playerParty];
    const updatedHero = { ...hero, automations: [...hero.automations] };
    const ruleIdx = updatedHero.automations.findIndex(r => r.id === existingRule.id);
    if (ruleIdx !== -1) {
      updatedHero.automations[ruleIdx] = {
        ...existingRule,
        target: { blocks: blocks.map(b => ({ ...b })) },
      };
    }
    party[heroIdx] = updatedHero;
    gameStore.setPlayerParty(party);
    gameStore.notifyPartyUpdate();
    gameStore.clearEditing();
    gameStore.goToScreen('party-setup');
  };

  const handleDeleteBlock = (idx: number) => {
    const updated = blocks.filter((_, i) => i !== idx);
    setBlocks(updated);
    // Si on supprime le bloc actif, on revient au premier ou à la sélection de cible
    if (updated.length === 0) {
        setActiveBlockIdx(0);
        setStep('kind'); // ou 'kind' dans GambitTargetEditor
    } else {
        setActiveBlockIdx(Math.min(idx, updated.length - 1));
    }
};

  const canConfirm = blocks.length > 0 && blocks.every(b =>
    b.targetKind === 'self' || b.filters.length > 0
  );

  const crumbs = [
    `Gambit "${existingRule?.name ?? '???'}"`,
    step === 'kind' ? 'Choisir une cible'
      : addingMore ? 'Ajouter un filtre'
      : `Filtres — ${TARGET_CONFIG.find(c => c.kind === activeBlock?.targetKind)?.kindLabel ?? ''}`,
  ];

  return (
    <div style={S.root}>
      {/* HEADER */}
      <div style={S.header}>
        <span style={S.breadcrumb}>{crumbs.join(' > ')}</span>
        <GambitSummary blocks={blocks} rule={existingRule} />
      </div>

      {/* BARRE DE BLOCS OU */}
      <div style={S.blocksBar}>
        {blocks.map((block, i) => (
          <BlockThumb key={block.id} block={block} isActive={i === activeBlockIdx}
            onClick={() => { setActiveBlockIdx(i); setAddingMore(false); setStep('filters'); }}
          />
        ))}
        <BlockThumb block={null} isActive={false} onClick={handleAddBlock} />
      </div>

      {blocks.length > 0 && (
        <div style={S.activeLabel}>{summaryText(blocks)}</div>
      )}

      <div style={S.divider} />

      {/* BODY */}
      <div style={S.body}>

        {step === 'kind' && (
          <>
            <h2 style={S.stepTitle}>Choisir le type de cible</h2>
            <KindSelector onSelect={handleSelectKind} />
          </>
        )}

        {step === 'filters' && activeBlock && (
          <div style={S.filterLayout}>
            {/* Gauche: kind + liste ET */}
            <div style={S.filterLeft}>
              <div style={S.filterKindCard}>
                <div style={{ color: '#059669' }}>
                  <KindIcon kind={activeBlock.targetKind} size={40} />
                </div>
                <span style={S.filterKindLabel}>
                  {TARGET_CONFIG.find(c => c.kind === activeBlock.targetKind)?.kindLabel}
                </span>
              </div>

              {!isSelfKind && <div style={S.etArrow}>{'>>'}</div>}

              {!isSelfKind && (
                <div style={S.etList}>
                  {activeBlock.filters.length === 0 && !addingMore && (
                    <div
                    style={S.confirmBtn}
                    onClick={() => handleDeleteBlock(activeBlockIdx)}
                    >Supprimer le filtre ✕</div>
                  )}
                  {activeBlock.filters.map(f => (
                    <div key={f.id} style={S.etItem}>
                      <span style={S.etIcon}>
                        {f.categoryId === 'health' ? '<3' : f.categoryId === 'distance' ? '↔' : f.categoryId === 'count' ? '#' : '◎'}
                      </span>
                      <span style={S.etText}>{f.value.label}</span>
                      <button style={S.etDelete} onClick={() => handleDeleteFilter(f.id)}>✕</button>
                    </div>
                  ))}
                  <button
                    style={{ ...S.etAddBtn, ...(addingMore ? S.etAddBtnActive : {}) }}
                    onClick={() => setAddingMore(m => !m)}
                  >
                    {addingMore ? '✕ Annuler' : '+ Ajouter un filtre'}
                  </button>
                </div>
              )}

              {isSelfKind && (
                <div style={S.selfNote}>Cible automatiquement le héros lui-même. Aucun filtre nécessaire.</div>
              )}
            </div>

            {/* Droite: sélecteur */}
            {!isSelfKind && (addingMore || activeBlock.filters.length === 0) && (
              <div style={S.cvsWrapper}>
                <div style={S.cvsHint}>
                  {addingMore ? 'Ajouter un filtre supplémentaire (ET)' : 'Choisir le premier filtre'}
                </div>
                <FilterSelector
                  kind={activeBlock.targetKind}
                  onSelect={handleSelectFilter}
                  selectedIds={selectedIds}
                />
              </div>
            )}

            {!isSelfKind && !addingMore && activeBlock.filters.length > 0 && (
              <div style={S.doneHint}>
                <div style={S.doneIcon}>✓</div>
                <div style={S.doneText}>{activeBlock.filters.length} filtre{activeBlock.filters.length > 1 ? 's' : ''} configuré{activeBlock.filters.length > 1 ? 's' : ''}</div>
                <div style={S.doneSubtext}>
                  Clique sur <strong>+ Ajouter un filtre</strong> pour affiner (ET),<br />
                  ou sur le <strong>+ dans la barre</strong> pour créer une alternative (OU).
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={S.footer}>
        <kbd style={S.key}>ESC</kbd>
        <button style={S.footerBtn} onClick={handleBack}>Back</button>
        <span style={{ flex: 1 }} />
        {canConfirm && (
          <button style={S.confirmBtn} onClick={handleConfirm}>✓ Confirmer la cible</button>
        )}
        <kbd style={S.key}>ENTER</kbd>
        <span style={S.footerLabel}>Select</span>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const font  = '"JetBrains Mono", monospace';
const green = '#10b981';

const S: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100%', fontFamily: font, color: '#e2e8f0', background: '#d1e8df', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 20px 10px', flexShrink: 0, gap: '16px' },
  breadcrumb: { fontSize: '13px', fontWeight: 'bold', color: '#065f46', paddingTop: '4px' },
  summary: { background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '8px', padding: '8px 14px', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 },
  summaryTitle: { fontSize: '9px', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' },
  summaryRow: { display: 'flex', gap: '8px', alignItems: 'baseline' },
  summaryTag: { fontSize: '9px', color: '#059669', minWidth: '14px', flexShrink: 0 },
  summaryText: { fontSize: '10px', color: '#064e3b', fontFamily: font },
  blocksBar: { display: 'flex', gap: '8px', padding: '0 20px 8px', flexShrink: 0, flexWrap: 'wrap' },
  thumb: { width: '84px', height: '84px', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', background: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px', gap: '3px', transition: 'all 0.15s', fontFamily: font },
  thumbActive: { border: `2px solid ${green}`, background: 'rgba(16,185,129,0.2)' },
  thumbAdd: { border: '1px dashed rgba(16,185,129,0.35)', background: 'rgba(255,255,255,0.15)' },
  activeLabel: { margin: '0 20px', padding: '10px 16px', background: green, color: '#fff', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px', flexShrink: 0 },
  divider: { height: '1px', background: 'rgba(16,185,129,0.2)', margin: '10px 0 0', flexShrink: 0 },
  body: { flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column' },
  stepTitle: { fontSize: '22px', fontWeight: 'bold', color: '#064e3b', textAlign: 'center', margin: '8px 0 24px', fontFamily: font },
  kindGrid: { display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' },
  kindCard: { width: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '16px 8px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '8px', cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' },
  kindCardHover: { background: 'rgba(16,185,129,0.15)', border: `1px solid ${green}` },
  kindImg: { width: '110px', height: '90px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' },
  kindLabel: { fontSize: '14px', fontWeight: 'bold', color: '#064e3b' },
  filterLayout: { display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 },
  filterLeft: { display: 'flex', alignItems: 'flex-start', gap: '12px', flexShrink: 0 },
  filterKindCard: { width: '90px', minHeight: '90px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', flexShrink: 0 },
  filterKindLabel: { fontSize: '11px', fontWeight: 'bold', color: '#064e3b' },
  etArrow: { color: '#059669', fontSize: '14px', paddingTop: '30px', flexShrink: 0 },
  etList: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '170px' },
  etItem: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', background: 'rgba(16,185,129,0.12)', border: `1px solid ${green}`, borderRadius: '6px', fontSize: '11px' },
  etIcon: { color: green, fontSize: '12px', flexShrink: 0 },
  etText: { flex: 1, color: '#064e3b', fontFamily: font, fontSize: '11px' },
  etDelete: { background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '11px', padding: '0 2px', fontFamily: font, flexShrink: 0 },
  etEmpty: { padding: '10px', color: '#059669', fontSize: '11px', fontStyle: 'italic', border: '1px dashed rgba(16,185,129,0.4)', borderRadius: '6px', textAlign: 'center' },
  etAddBtn: { padding: '7px 12px', background: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(16,185,129,0.4)', borderRadius: '6px', color: '#065f46', cursor: 'pointer', fontFamily: font, fontSize: '11px', textAlign: 'center', transition: 'all 0.15s', marginTop: '4px' },
  etAddBtnActive: { background: 'rgba(16,185,129,0.1)', border: `1px solid ${green}`, color: '#064e3b' },
  selfNote: { maxWidth: '200px', padding: '12px', fontSize: '11px', color: '#065f46', fontStyle: 'italic', border: '1px dashed rgba(16,185,129,0.4)', borderRadius: '6px' },
  cvsWrapper: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '8px' },
  cvsHint: { fontSize: '10px', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px' },
  cvs: { display: 'flex', gap: '0' },
  cvsCol: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '190px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px', borderRight: '3px solid rgba(16,185,129,0.2)' },
  cvsItem: { padding: '10px 14px', background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: font, fontSize: '12px', color: '#064e3b', textAlign: 'left', transition: 'background 0.1s', display: 'flex', alignItems: 'center' },
  cvsItemActive: { background: green, color: '#fff' },
  cvsItemSelected: { background: 'rgba(16,185,129,0.15)', color: '#064e3b', cursor: 'default', opacity: 0.7 },
  cvsArrow: { color: '#059669', fontSize: '14px', padding: '12px 12px 0', flexShrink: 0, alignSelf: 'flex-start' },
  doneHint: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px', color: '#065f46' },
  doneIcon: { fontSize: '32px', color: green },
  doneText: { fontSize: '14px', fontWeight: 'bold', color: '#064e3b' },
  doneSubtext: { fontSize: '11px', color: '#065f46', textAlign: 'center', lineHeight: 1.7 },
  footer: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderTop: '1px solid rgba(16,185,129,0.3)', flexShrink: 0, background: 'rgba(209,232,223,0.9)' },
  key: { padding: '2px 6px', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '3px', fontSize: '10px', fontFamily: font, color: '#064e3b', fontStyle: 'normal' },
  footerBtn: { background: 'transparent', border: 'none', color: '#065f46', fontFamily: font, fontSize: '11px', cursor: 'pointer', padding: 0 },
  confirmBtn: { padding: '7px 18px', background: green, color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontFamily: font, fontSize: '11px', fontWeight: 'bold' },
  footerLabel: { fontSize: '11px', color: '#065f46' },
};
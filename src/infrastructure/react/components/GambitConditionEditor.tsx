import React, { useState, useEffect } from 'react';
import { gameStore } from '@infra/bridge/GameStore';
import { useGameStore } from '@infra/react/hooks/useGameStore';
import {
    ActionType,
    type AutomationRule,
} from '@domain/shared/types';
import {
    CONDITION_CONFIG,
    type ConditionTargetKind,
    type ConditionValue,
} from '@domain/shared/conditionConfig';

// ─── Types locaux ─────────────────────────────────────────────

interface AtomicCondition {
    id: string;
    categoryId: string;
    value: ConditionValue;
}

interface ConditionBlock {
    id: string;
    targetKind: ConditionTargetKind;
    conditions: AtomicCondition[];
}

type EditorStep = 'target' | 'conditions';

// ─── Helpers ──────────────────────────────────────────────────

function uid() {
    return Math.random().toString(36).slice(2, 8);
}

function blockLabel(block: ConditionBlock): string {
    const cfg = CONDITION_CONFIG.find(c => c.target === block.targetKind);
    if (!cfg) return '???';
    if (block.conditions.length === 0) return cfg.targetLabel;
    return block.conditions.map(c => c.value.label).join(' OU ');
}

function summaryText(blocks: ConditionBlock[]): string {
    if (blocks.length === 0) return '—';
    return blocks.map(b => blockLabel(b)).join(' ET ');
}

// Reconstitue des blocs depuis une AutomationRule existante
function blocksFromRule(rule: AutomationRule): ConditionBlock[] {
  // On reconstitue un bloc par condition de la règle
  return rule.conditions.map(condition => ({
    id: uid(),
    targetKind: condition.targetKind, // On suppose que la règle a bien un targetKind
    conditions: condition.conditions.map(c => ({
      id: uid(),
      categoryId: c.categoryId,
      value: c.value,
    })),
  }));
}

// ─── TargetIcon ───────────────────────────────────────────────

function TargetIcon({ kind, size = 48 }: { kind: ConditionTargetKind; size?: number }) {
    const s = { width: size, height: size };
    const icons: Record<ConditionTargetKind, React.ReactNode> = {
        self: (
            <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
        ),
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
        other: (
            <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v4l3 3"/>
            </svg>
        ),
    };
    return <>{icons[kind]}</>;
}

// ─── BlockThumb ───────────────────────────────────────────────

function BlockThumb({
    block, isActive, onClick,
}: {
    block: ConditionBlock | null;
    isActive: boolean;
    onClick: () => void;
}) {
    const cfg = block ? CONDITION_CONFIG.find(c => c.target === block.targetKind) : null;
    return (
        <button onClick={onClick} style={{
            ...S.thumb,
            ...(isActive ? S.thumbActive : {}),
            ...(block === null ? S.thumbAdd : {}),
        }}>
            {block === null ? (
                <span style={{ fontSize: '22px', color: '#9f7aea' }}>+</span>
            ) : (
                <>
                    <div style={{ color: isActive ? '#fff' : '#7c5cbf' }}>
                        <TargetIcon kind={block.targetKind} size={24} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: isActive ? '#fff' : '#3b1f6e' }}>
                        {cfg?.targetLabel}
                    </span>
                    <span style={{
                        fontSize: '9px',
                        color: isActive ? '#c4b5fd' : '#6b5a8e',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        whiteSpace: 'pre-line',
                    }}>
                        {block.conditions.length > 0
                            ? block.conditions.map(c => c.value.label).join('\n+ ')
                            : '—'}
                    </span>
                </>
            )}
        </button>
    );
}

// ─── TargetSelector ───────────────────────────────────────────

function TargetSelector({ onSelect }: { onSelect: (kind: ConditionTargetKind) => void }) {
    const [hovered, setHovered] = useState<string | null>(null);
    return (
        <div style={S.targetGrid}>
            {CONDITION_CONFIG.map(cfg => (
                <button
                    key={cfg.target}
                    style={{
                        ...S.targetCard,
                        ...(hovered === cfg.target ? S.targetCardHover : {}),
                    }}
                    onMouseEnter={() => setHovered(cfg.target)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelect(cfg.target)}
                >
                    <div style={S.targetImg}>
                        <TargetIcon kind={cfg.target} size={52} />
                    </div>
                    <span style={S.targetLabel}>{cfg.targetLabel}</span>
                </button>
            ))}
        </div>
    );
}

// ─── ConditionValueSelector ───────────────────────────────────

function ConditionValueSelector({
    targetKind,
    onSelect,
    selectedValueIds,
}: {
    targetKind: ConditionTargetKind;
    onSelect: (categoryId: string, value: ConditionValue) => void;
    selectedValueIds: string[];
}) {
    const cfg = CONDITION_CONFIG.find(c => c.target === targetKind)!;
    const [selectedCat, setSelectedCat] = useState<string>(cfg.categories[0]?.id ?? '');

    useEffect(() => {
        setSelectedCat(cfg.categories[0]?.id ?? '');
    }, [targetKind]);

    const values = cfg.valuesByCategory[selectedCat] ?? [];

    return (
        <div style={S.cvs}>
            {/* Catégories */}
            <div style={S.cvsCol}>
                {cfg.categories.map(cat => (
                    <button
                        key={cat.id}
                        style={{
                            ...S.cvsItem,
                            ...(selectedCat === cat.id ? S.cvsItemActive : {}),
                        }}
                        onClick={() => setSelectedCat(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            <div style={S.cvsArrow}>{'>>'}</div>

            {/* Valeurs */}
            <div style={S.cvsCol}>
                {values.map(v => {
                    const already = selectedValueIds.includes(v.id);
                    return (
                        <button
                            key={v.id}
                            style={{
                                ...S.cvsItem,
                                ...(already ? S.cvsItemSelected : {}),
                            }}
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

// ─── GambitSummary ────────────────────────────────────────────

function GambitSummary({
    blocks,
    rule,
}: {
    blocks: ConditionBlock[];
    rule: AutomationRule | null;
}) {
    return (
        <div style={S.summary}>
            <div style={S.summaryTitle}>Résumé du gambit</div>
            <div style={S.summaryRow}>
                <span style={S.summaryTag}>SI</span>
                <span style={S.summaryText}>{summaryText(blocks)}</span>
            </div>
            <div style={S.summaryRow}>
                <span style={S.summaryTag}>→</span>
                <span style={{ ...S.summaryText, opacity: 0.4 }}>
                    {rule?.action.type ?? '— (à définir)'}
                </span>
            </div>
            <div style={S.summaryRow}>
                <span style={S.summaryTag}>⊕</span>
                <span style={{ ...S.summaryText, opacity: 0.4 }}>
                    {rule?.target?.blocks?.length
                        ? rule.target.blocks.map((b: any) => {
                            const kind = b.targetKind;
                            const filters = b.filters?.map((f: any) => f.value.label).join(' ET ') ?? '';
                            return filters ? `${kind} (${filters})` : kind;
                            }).join(' OU ')
                        : '— (à définir)'}
                </span>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════

export function GambitConditionEditor(): React.ReactElement {
    const store = useGameStore();

    const heroIdx      = store.editingHeroIndex ?? 0;
    const hero         = gameStore.playerParty[heroIdx] ?? null;
    const existingRule = hero?.automations.find(r => r.id === store.editingRuleId) ?? null;
    const isEditing    = existingRule !== null;

    const [blocks, setBlocks]                = useState<ConditionBlock[]>([]);
    const [activeBlockIdx, setActiveBlockIdx] = useState<number>(0);
    const [step, setStep]                    = useState<EditorStep>('target');
    // true quand l'utilisateur clique "+" dans etList pour ajouter une sous-condition
    const [addingMore, setAddingMore]         = useState<boolean>(false);

    // Initialisation : si édition, reconstituer les blocs et aller direct sur conditions
    useEffect(() => {
        if (isEditing && existingRule) {
            const restored = blocksFromRule(existingRule);
            setBlocks(restored);
            setActiveBlockIdx(0);
            setStep('conditions');  // ← saute la sélection de cible
            setAddingMore(false);
        } else {
            setBlocks([]);
            setActiveBlockIdx(0);
            setStep('target');
            setAddingMore(false);
        }
    }, [store.editingRuleId]);

    const activeBlock      = blocks[activeBlockIdx] ?? null;
    const selectedValueIds = activeBlock?.conditions.map(c => c.value.id) ?? [];

    // ─── Handlers ────────────────────────────────────────────

    const handleSelectTarget = (kind: ConditionTargetKind) => {
        const newBlock: ConditionBlock = { id: uid(), targetKind: kind, conditions: [] };
        const updated = [...blocks];
        if (activeBlockIdx >= updated.length) {
            updated.push(newBlock);
        } else {
            updated[activeBlockIdx] = newBlock;
        }
        setBlocks(updated);
        setAddingMore(false);
        setStep('conditions');
    };

    const handleSelectValue = (categoryId: string, value: ConditionValue) => {
        if (!activeBlock) return;
        const atomic: AtomicCondition = { id: uid(), categoryId, value };
        const updatedBlock: ConditionBlock = {
            ...activeBlock,
            conditions: [...activeBlock.conditions, atomic],
        };
        const updated = [...blocks];
        updated[activeBlockIdx] = updatedBlock;
        setBlocks(updated);
        setAddingMore(false); // referme le panneau "ajouter plus" après sélection
    };

    const handleDeleteCondition = (condId: string) => {
        if (!activeBlock) return;
        const updatedBlock: ConditionBlock = {
            ...activeBlock,
            conditions: activeBlock.conditions.filter(c => c.id !== condId),
        };
        const updated = [...blocks];
        updated[activeBlockIdx] = updatedBlock;
        setBlocks(updated);
    };

    const handleAddBlock = () => {
        setActiveBlockIdx(blocks.length);
        setAddingMore(false);
        setStep('target');
    };

    const handleBack = () => {
        if (addingMore) {
            setAddingMore(false);
        } else if (step === 'conditions' && !isEditing) {
            setStep('target');
        } else {
            gameStore.clearEditing();
            gameStore.goToScreen('party-setup');
        }
    };

    const handleConfirm = () => {
        if (!hero || blocks.length === 0) return;

        const party = [...store.playerParty];
        const updatedHero = { ...hero, automations: [...hero.automations] };

        if (existingRule) {
            const ruleIdx = updatedHero.automations.findIndex(r => r.id === existingRule.id);
            if (ruleIdx !== -1) {
                updatedHero.automations[ruleIdx] = {
                    ...existingRule,
                    name: summaryText(blocks),
                    conditions: blocks,
                };
            }
        } else {
            updatedHero.automations.push({
                id: `rule_${uid()}`,
                name: summaryText(blocks),
                priority: updatedHero.automations.length,
                conditions: blocks,  // ← même chose ici
                action: { type: ActionType.PassTurn, params: {} },
                target: { blocks: [] },
            });
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
            setStep('target'); // ou 'kind' dans GambitTargetEditor
        } else {
            setActiveBlockIdx(Math.min(idx, updated.length - 1));
        }
    };

    // ─── Breadcrumb ──────────────────────────────────────────

    const crumbs = [
        isEditing ? `Éditer "${existingRule!.name}"` : 'Nouveau gambit',
        step === 'target'
            ? 'Choisir une cible'
            : addingMore
                ? 'Ajouter une condition'
                : `Conditions — ${CONDITION_CONFIG.find(c => c.target === activeBlock?.targetKind)?.targetLabel ?? ''}`,
    ];

    // ─── Render ──────────────────────────────────────────────

    return (
        <div style={S.root}>
            {/* ── HEADER ──────────────────────────────── */}
            <div style={S.header}>
                <span style={S.breadcrumb}>{crumbs.join(' > ')}</span>
                <GambitSummary blocks={blocks} rule={existingRule} />
            </div>

            {/* ── BARRE BLOCS OU ──────────────────────── */}
            <div style={S.blocksBar}>
                {blocks.map((block, i) => (
                    <BlockThumb
                        key={block.id}
                        block={block}
                        isActive={i === activeBlockIdx}
                        onClick={() => {
                            setActiveBlockIdx(i);
                            setAddingMore(false);
                            setStep('conditions');
                        }}
                    />
                ))}
                <BlockThumb block={null} isActive={false} onClick={handleAddBlock} />
            </div>

            {blocks.length > 0 && (
                <div style={S.activeLabel}>{summaryText(blocks)}</div>
            )}

            <div style={S.divider} />

            {/* ── CORPS ───────────────────────────────── */}
            <div style={S.body}>

                {/* Étape 1 : sélection de la cible (création seulement) */}
                {step === 'target' && (
                    <>
                        <h2 style={S.stepTitle}>Sélectionner une cible</h2>
                        <TargetSelector onSelect={handleSelectTarget} />
                    </>
                )}

                {/* Étape 2 : conditions */}
                {step === 'conditions' && activeBlock && (
                    <div style={S.conditionLayout}>

                        {/* ── Gauche : cible + liste ET ─────────── */}
                        <div style={S.conditionLeft}>
                            {/* Carte cible */}
                            <div style={S.conditionTargetCard}>
                                <div style={{ color: '#7c5cbf' }}>
                                    <TargetIcon kind={activeBlock.targetKind} size={40} />
                                </div>
                                <span style={S.conditionTargetLabel}>
                                    {CONDITION_CONFIG.find(c => c.target === activeBlock.targetKind)?.targetLabel}
                                </span>
                            </div>

                            <div style={S.etArrow}>{'>>'}</div>

                            {/* Liste des sous-conditions ET */}
                            <div style={S.etList}>
                                {activeBlock.conditions.length === 0 && !addingMore && (
                                    <div
                                    style={S.confirmBtn}
                                    onClick={() => handleDeleteBlock(activeBlockIdx)}
                                    >Supprimer le bloc de condition ✕</div>
                                )}

                                {activeBlock.conditions.map(cond => (
                                    <div key={cond.id} style={S.etItem}>
                                        <span style={S.etIcon}>
                                            {cond.categoryId === 'health'   ? '<3'
                                            : cond.categoryId === 'armor'   ? '◎'
                                            : cond.categoryId === 'distance'? '↔'
                                            : cond.categoryId === 'count'   ? '#'
                                            : '✦'}
                                        </span>
                                        <span style={S.etText}>{cond.value.label}</span>
                                        <button
                                            style={S.etDelete}
                                            onClick={() => handleDeleteCondition(cond.id)}
                                            title="Supprimer cette condition"
                                        >✕</button>
                                    </div>
                                ))}

                                {/* Bouton + pour ajouter une sous-condition ET */}
                                <button
                                    style={{
                                        ...S.etAddBtn,
                                        ...(addingMore ? S.etAddBtnActive : {}),
                                    }}
                                    onClick={() => setAddingMore(m => !m)}
                                    title="Ajouter une condition supplémentaire (ET)"
                                >
                                    {addingMore ? '✕ Annuler' : '+ Ajouter une condition'}
                                </button>
                            </div>
                        </div>

                        {/* ── Droite : sélecteur catégorie/valeur ── */}
                        {/* Toujours visible en édition, ou visible si addingMore ou pas encore de condition */}
                        {(addingMore || activeBlock.conditions.length === 0) && (
                            <div style={S.cvsWrapper}>
                                <div style={S.cvsHint}>
                                    {addingMore
                                        ? 'Choisir une condition supplémentaire (ET)'
                                        : 'Choisir la première condition'}
                                </div>
                                <ConditionValueSelector
                                    targetKind={activeBlock.targetKind}
                                    onSelect={handleSelectValue}
                                    selectedValueIds={selectedValueIds}
                                />
                            </div>
                        )}

                        {/* Message quand tout est configuré et pas en mode ajout */}
                        {!addingMore && activeBlock.conditions.length > 0 && (
                            <div style={S.doneHint}>
                                <div style={S.doneIcon}>✓</div>
                                <div style={S.doneText}>
                                    {activeBlock.conditions.length} condition{activeBlock.conditions.length > 1 ? 's' : ''} configurée{activeBlock.conditions.length > 1 ? 's' : ''}
                                </div>
                                <div style={S.doneSubtext}>
                                    Clique sur <strong>+ Ajouter une condition</strong> pour combiner avec un OU,<br />
                                    ou sur le <strong>+ dans la barre</strong> pour créer un bloc ET.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── FOOTER ──────────────────────────────── */}
            <div style={S.footer}>
                <kbd style={S.key}>ESC</kbd>
                <button style={S.footerBtn} onClick={handleBack}>Back</button>
                <span style={{ flex: 1 }} />
                {step === 'conditions' && activeBlock && activeBlock.conditions.length > 0 && !addingMore && (
                    <button style={S.confirmBtn} onClick={handleConfirm}>
                        ✓ Confirmer la condition
                    </button>
                )}
                <kbd style={S.key}>ENTER</kbd>
                <span style={S.footerLabel}>Select</span>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────

const font   = '"JetBrains Mono", monospace';
const purple = '#7c3aed';

const S: Record<string, React.CSSProperties> = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: font,
        color: '#e2e8f0',
        background: '#c8c4e8',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '14px 20px 10px',
        flexShrink: 0,
        gap: '16px',
    },
    breadcrumb: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#3b1f6e',
        paddingTop: '4px',
    },
    summary: {
        background: 'rgba(255,255,255,0.3)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '8px',
        padding: '8px 14px',
        minWidth: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flexShrink: 0,
    },
    summaryTitle: {
        fontSize: '9px',
        color: '#5b2d9e',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '2px',
    },
    summaryRow: { display: 'flex', gap: '8px', alignItems: 'baseline' },
    summaryTag: { fontSize: '9px', color: '#7c5cbf', minWidth: '14px', flexShrink: 0 },
    summaryText: { fontSize: '10px', color: '#2d1b5e', fontFamily: font },

    blocksBar: {
        display: 'flex',
        gap: '8px',
        padding: '0 20px 8px',
        flexShrink: 0,
        flexWrap: 'wrap',
    },
    thumb: {
        width: '84px',
        height: '84px',
        border: '1px solid rgba(100,80,180,0.3)',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.3)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        gap: '3px',
        transition: 'all 0.15s',
        fontFamily: font,
    },
    thumbActive: {
        border: '2px solid #7c3aed',
        background: 'rgba(124,58,237,0.15)',
    },
    thumbAdd: {
        border: '1px dashed rgba(100,80,180,0.35)',
        background: 'rgba(255,255,255,0.15)',
    },
    activeLabel: {
        margin: '0 20px',
        padding: '10px 16px',
        background: purple,
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
        borderRadius: '6px',
        flexShrink: 0,
    },
    divider: {
        height: '1px',
        background: 'rgba(100,80,180,0.2)',
        margin: '10px 0 0',
        flexShrink: 0,
    },
    body: {
        flex: 1,
        overflow: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
    },
    stepTitle: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#2d1b5e',
        textAlign: 'center',
        margin: '8px 0 24px',
        fontFamily: font,
    },
    targetGrid: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    targetCard: {
        width: '150px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 8px',
        background: 'rgba(255,255,255,0.35)',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '8px',
        cursor: 'pointer',
        fontFamily: font,
        transition: 'all 0.15s',
    },
    targetCardHover: {
        background: 'rgba(124,58,237,0.15)',
        border: '1px solid #7c3aed',
    },
    targetImg: {
        width: '110px',
        height: '90px',
        background: 'rgba(255,255,255,0.4)',
        border: '1px solid rgba(180,160,220,0.4)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7c5cbf',
    },
    targetLabel: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2d1b5e',
    },

    conditionLayout: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        flex: 1,
    },
    conditionLeft: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        flexShrink: 0,
    },
    conditionTargetCard: {
        width: '90px',
        minHeight: '90px',
        background: 'rgba(255,255,255,0.35)',
        border: '1px solid rgba(180,160,220,0.4)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px',
        flexShrink: 0,
    },
    conditionTargetLabel: {
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#2d1b5e',
    },
    etArrow: {
        color: '#9f7aea',
        fontSize: '14px',
        paddingTop: '30px',
        flexShrink: 0,
    },
    etList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '170px',
    },
    etItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 10px',
        background: 'rgba(124,58,237,0.12)',
        border: '1px solid #a78bfa',
        borderRadius: '6px',
        fontSize: '11px',
    },
    etIcon: { color: '#a78bfa', fontSize: '12px', flexShrink: 0 },
    etText: { flex: 1, color: '#2d1b5e', fontFamily: font, fontSize: '11px' },
    etDelete: {
        background: 'transparent',
        border: 'none',
        color: '#9f7aea',
        cursor: 'pointer',
        fontSize: '11px',
        padding: '0 2px',
        fontFamily: font,
        flexShrink: 0,
    },
    etEmpty: {
        padding: '10px',
        color: '#9f7aea',
        fontSize: '11px',
        fontStyle: 'italic',
        border: '1px dashed rgba(124,58,237,0.3)',
        borderRadius: '6px',
        textAlign: 'center',
    },
    etAddBtn: {
        padding: '7px 12px',
        background: 'rgba(255,255,255,0.3)',
        border: '1px dashed rgba(124,58,237,0.4)',
        borderRadius: '6px',
        color: '#6d28d9',
        cursor: 'pointer',
        fontFamily: font,
        fontSize: '11px',
        textAlign: 'center',
        transition: 'all 0.15s',
        marginTop: '4px',
    },
    etAddBtnActive: {
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid #7c3aed',
        color: '#4c1d95',
    },

    cvsWrapper: {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    cvsHint: {
        fontSize: '10px',
        color: '#6d28d9',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        paddingBottom: '4px',
    },
    cvs: {
        display: 'flex',
        gap: '0',
    },
    cvsCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        minWidth: '190px',
        maxHeight: '320px',
        overflowY: 'auto',
        paddingRight: '4px',
        borderRight: '3px solid rgba(124,58,237,0.2)',
    },
    cvsItem: {
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.4)',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: font,
        fontSize: '12px',
        color: '#2d1b5e',
        textAlign: 'left',
        transition: 'background 0.1s',
        display: 'flex',
        alignItems: 'center',
    },
    cvsItemActive: {
        background: purple,
        color: '#fff',
    },
    cvsItemSelected: {
        background: 'rgba(124,58,237,0.15)',
        color: '#3b1f6e',
        cursor: 'default',
        opacity: 0.7,
    },
    cvsArrow: {
        color: '#9f7aea',
        fontSize: '14px',
        padding: '12px 12px 0',
        flexShrink: 0,
        alignSelf: 'flex-start',
    },

    doneHint: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '20px',
        color: '#5b2d9e',
    },
    doneIcon: {
        fontSize: '32px',
        color: '#7c3aed',
    },
    doneText: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#3b1f6e',
    },
    doneSubtext: {
        fontSize: '11px',
        color: '#7c5cbf',
        textAlign: 'center',
        lineHeight: 1.7,
    },

    footer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderTop: '1px solid rgba(180,160,220,0.3)',
        flexShrink: 0,
        background: 'rgba(200,196,232,0.8)',
    },
    key: {
        padding: '2px 6px',
        background: 'rgba(255,255,255,0.3)',
        border: '1px solid rgba(180,160,220,0.4)',
        borderRadius: '3px',
        fontSize: '10px',
        fontFamily: font,
        color: '#3b1f6e',
        fontStyle: 'normal',
    },
    footerBtn: {
        background: 'transparent',
        border: 'none',
        color: '#5b2d9e',
        fontFamily: font,
        fontSize: '11px',
        cursor: 'pointer',
        padding: 0,
    },
    confirmBtn: {
        padding: '7px 18px',
        background: purple,
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontFamily: font,
        fontSize: '11px',
        fontWeight: 'bold',
    },
    footerLabel: { fontSize: '11px', color: '#5b2d9e' },
};
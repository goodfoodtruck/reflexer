import React, { useEffect, useState } from 'react';
import { gameStore } from '@infra/bridge/GameStore';
import { useGameStore } from '@infra/react/hooks/useGameStore';
import {
    ActionType,
    ConditionType,
    TargetType,
    type EntityDefinition,
    type AutomationRule,
    ConditionBlock,
    AutomationTarget,
} from '@domain/shared/types';
import { TARGET_CONFIG } from '@domain/shared/targetConfig';

const COND_LABELS: Record<string, string> = {
    [ConditionType.Always]:          'Toujours',
    [ConditionType.HealthBelow]:     'PV < %',
    [ConditionType.HealthAbove]:     'PV > %',
    [ConditionType.EnemyInRange]:    'Ennemi proche',
    [ConditionType.AllyInRange]:     'Allié proche',
    [ConditionType.AllyHealthBelow]: 'Allié PV < %',
    [ConditionType.EnemyCount]:      'Nb ennemis ≥',
    [ConditionType.HasStatusEffect]: 'A un effet',
};

const ACT_LABELS: Record<string, string> = {
    [ActionType.CastSpell]: 'Sort',
    [ActionType.Move]:      'Déplacer',
    [ActionType.Flee]:      'Fuir',
    [ActionType.Defend]:    'Défendre',
    [ActionType.PassTurn]:  'Passer',
};

const TGT_LABELS: Record<string, string> = {
    [TargetType.NearestEnemy]:   'Ennemi proche',
    [TargetType.WeakestEnemy]:   'Ennemi faible',
    [TargetType.StrongestEnemy]: 'Ennemi fort',
    [TargetType.FurthestEnemy]:  'Ennemi loin',
    [TargetType.NearestAlly]:    'Allié proche',
    [TargetType.WeakestAlly]:    'Allié faible',
    [TargetType.Self]:           'Soi-même',
};

const ICONS = {
    condition: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3"/>
        </svg>
    ),
    action: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
    ),
    target: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
    ),
};

function Tooltip({ text }: { text: string }) {
    return (
        <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f172a',
            color: '#e2e8f0',
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            border: '1px solid #334155',
            pointerEvents: 'none',
            zIndex: 10,
        }}>
            {text}
        </div>
    );
}

function RuleCell({
    icon, label, onClick, colType, disabled = false,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    colType: 'condition' | 'action' | 'target';
    disabled?: boolean;
}) {
    const [hovered, setHovered] = useState(false);

    const accentColor = {
        condition: '#6366f1',
        action:    '#f59e0b',
        target:    '#10b981',
    }[colType];

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={onClick}
                disabled={disabled}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    width: '72px',
                    height: '72px',
                    border: `1px solid ${hovered && !disabled ? accentColor : '#334155'}`,
                    borderRadius: '6px',
                    background: hovered && !disabled
                        ? `rgba(${colType === 'condition' ? '99,102,241' : colType === 'action' ? '245,158,11' : '16,185,129'},0.1)`
                        : '#111827',
                    color: disabled ? '#1e293b' : hovered ? accentColor : '#64748b',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s',
                    padding: '4px',
                    opacity: disabled ? 0.4 : 1,
                }}
            >
                {icon}
                <span style={{ fontSize: '9px', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.2 }}>
                    {label}
                </span>
            </button>
            {hovered && !disabled && <Tooltip text={label} />}
        </div>
    );
}

function Arrow() {
    return (
        <div style={{ color: '#334155', fontSize: '18px', lineHeight: 1, userSelect: 'none', paddingBottom: '20px' }}>
            →
        </div>
    );
}

function conditionsLbl(conditions: ConditionBlock[]) {
    if (!conditions || conditions.length === 0) return 'Toujours';
    if (conditions.length > 1) {
        return conditions.map(condition =>
            condition.conditions[0]?.value?.label ?? '???'
        ).join(' ET ');
    }
    return conditions[0].conditions[0]?.value?.label ?? 'Toujours';
}

function targetLabel(target: AutomationTarget | undefined): string {
  if (!target?.blocks?.length) return '—';
  return target.blocks.map(block => {
    const cfg = TARGET_CONFIG.find(c => c.kind === block.targetKind);
    const kindLabel = cfg?.kindLabel ?? block.targetKind;
    if (block.targetKind === 'self' || !block.filters?.length) return kindLabel;
    const filterLabels = block.filters.map((f: any) => f.value.label).join(' ET ');
    return `${kindLabel} (${filterLabels})`;
  }).join(' OU ');
}

function RuleRow({
    rule, index, hero,
    onEditCondition, onEditTarget, onMoveUp, onMoveDown, onDelete, onEditAction
}: {
    rule: AutomationRule;
    index: number;
    hero: EntityDefinition;
    onEditCondition: () => void;
    onEditTarget: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    onEditAction: () => void;
}) {
    const spellName = rule.action.type === ActionType.CastSpell
        ? (hero.spells.find(s => s.id === rule.action.params['spellId'])?.name ?? '???')
        : ACT_LABELS[rule.action.type] ?? rule.action.type;

    const condLabel = conditionsLbl(rule.conditions);
    const tgtLabel = targetLabel(rule.target as any);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid #1e293b',
            marginBottom: '4px',
        }}>
            <span style={{ fontSize: '10px', color: '#475569', minWidth: '16px', fontFamily: 'inherit' }}>
                {index + 1}
            </span>

            {/* Condition — cliquable → ouvre l'éditeur */}
            <RuleCell
                icon={ICONS.condition}
                label={condLabel}
                onClick={onEditCondition}
                colType="condition"
            />
            <Arrow />

            {/* Action — désactivée pour l'instant */}
            <RuleCell
                icon={ICONS.action}
                label={spellName}
                onClick={onEditAction}
                colType="action"
            />
            <Arrow />

            {/* Cible — cliquable → ouvre l'éditeur de cible */}
            <RuleCell
                icon={ICONS.target}
                label={tgtLabel}
                onClick={onEditTarget}
                colType="target"
            />

            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                    style={S.miniBtn}
                    onClick={onMoveUp}
                    disabled={index === 0}
                    title="Déplacer vers le haut"
                >↑ Déplacer</button>
                <button
                    style={{ ...S.miniBtn, color: '#ef4444', borderColor: '#ef444433' }}
                    onClick={onDelete}
                    title="Supprimer"
                >✕ Retirer</button>
            </div>
        </div>
    );
}

function ColHeader({ label, icon, color }: { label: string; icon: string; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>{icon}</span>
            <span>{label}</span>
        </div>
    );
}

export function PartySetup(): React.ReactElement {
    const store = useGameStore();

    const [party, setParty] = useState<EntityDefinition[]>([]);

    useEffect(() => {
        const unsubscribe = gameStore.onPartyUpdate(() => {
            setParty([...store.playerParty]);
        });

        // Chargement initial
        setParty([...store.playerParty]);

        return unsubscribe;
    }, []);

    useEffect(() => {
        const p = gameStore.playerParty;
        if (p.length > 0) {
            setParty(p.map(d => ({ ...d, automations: [...d.automations], spells: [...d.spells] })));
        }
    }, [store.playerParty]);

    const persist = (updated: EntityDefinition[]) => {
        setParty(updated);
        gameStore.setPlayerParty(updated);
    };

    // Ouvre l'éditeur de condition pour une règle existante
    const handleEditCondition = (heroIdx: number, ruleId: string) => {
        gameStore.startEditingRule(heroIdx, ruleId);
    };

    // Ouvre l'éditeur de cible pour une règle existante
    const handleEditTarget = (heroIdx: number, ruleId: string) => {
        gameStore.startEditingTarget(heroIdx, ruleId);
    };

    // Ouvre l'éditeur de condition pour une nouvelle règle
    const handleAddRule = (heroIdx: number) => {
        gameStore.startEditingRule(heroIdx, null);
    };

    const handleEditAction = (heroIdx: number, ruleId: string) => {
        gameStore.startEditingAction(heroIdx, ruleId);
    };

    const handleMoveRule = (heroIdx: number, ruleIdx: number, dir: -1 | 1) => {
        const to = ruleIdx + dir;
        const hero = party[heroIdx];
        if (!hero || to < 0 || to >= hero.automations.length) return;
        const rules = [...hero.automations];
        [rules[ruleIdx], rules[to]] = [rules[to], rules[ruleIdx]];
        const updated = [...party];
        updated[heroIdx] = { ...hero, automations: rules };
        persist(updated);
    };

    const handleDeleteRule = (heroIdx: number, ruleIdx: number) => {
        const hero = party[heroIdx];
        if (!hero) return;
        const rules = hero.automations.filter((_, i) => i !== ruleIdx);
        const updated = [...party];
        updated[heroIdx] = { ...hero, automations: rules };
        persist(updated);
    };

    const handleLaunch = () => gameStore.startNewGame();
    const handleBack   = () => gameStore.goToScreen('menu');

    return (
        <div style={S.root}>
            <div style={S.header}>
                <span style={S.breadcrumb}>Nouvelle partie &gt; Configurer le duo</span>
                <button style={S.launchBtn} onClick={handleLaunch}>Lancer la partie ▸</button>
            </div>

            <div style={S.legend}>
                <div style={{ width: '16px' }} />
                <div style={{ width: '72px' }}><ColHeader label="Condition" icon="?" color="#6366f1" /></div>
                <div style={{ width: '18px' }} />
                <div style={{ width: '72px' }}><ColHeader label="Action" icon="⚡" color="#f59e0b" /></div>
                <div style={{ width: '18px' }} />
                <div style={{ width: '72px' }}><ColHeader label="Cible" icon="◎" color="#10b981" /></div>
            </div>

            <div style={S.columns}>
                {party.slice(0, 2).map((hero, heroIdx) => (
                    <div key={hero.name} style={S.col}>
                        <div style={S.portraitRow}>
                            <div style={S.portrait}>⚔</div>
                            <div>
                                <div style={S.heroName}>{hero.name}</div>
                                <div style={S.heroStats}>
                                    {hero.maxHp} PV · ATK {hero.stats.atk} · DEF {hero.stats.def} · SPD {hero.stats.spd}
                                </div>
                            </div>
                        </div>

                        <div style={S.chevron}>⌄</div>

                        <div style={S.rulesWrap}>
                            {hero.automations.length === 0 && (
                                <div style={S.emptyRules}>Aucun programme — ce héros ne fera rien !</div>
                            )}
                            {hero.automations.map((rule, ruleIdx) => (
                                <RuleRow
                                    key={rule.id}
                                    rule={rule}
                                    index={ruleIdx}
                                    hero={hero}
                                    onEditCondition={() => handleEditCondition(heroIdx, rule.id)}
                                    onEditTarget={() => handleEditTarget(heroIdx, rule.id)}
                                    onMoveUp={() => handleMoveRule(heroIdx, ruleIdx, -1)}
                                    onMoveDown={() => handleMoveRule(heroIdx, ruleIdx, 1)}
                                    onDelete={() => handleDeleteRule(heroIdx, ruleIdx)}
                                    onEditAction={() => handleEditAction(heroIdx, rule.id)}
                                />
                            ))}

                            <button style={S.addBtn} onClick={() => handleAddRule(heroIdx)}>
                                + Ajouter un comportement
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={S.footer}>
                <kbd style={S.key}>ESC</kbd>
                <button style={S.footerBtn} onClick={handleBack}>Back</button>
                <span style={{ flex: 1 }} />
                <kbd style={S.key}>ENTER</kbd>
                <span style={S.footerLabel}>Select</span>
            </div>
        </div>
    );
}

const font = '"JetBrains Mono", monospace';

const S: Record<string, React.CSSProperties> = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: font,
        color: '#e2e8f0',
        background: '#080c12',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
    },
    breadcrumb: { fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' },
    launchBtn: {
        padding: '8px 20px',
        background: '#22c55e',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontFamily: font,
        fontSize: '12px',
        fontWeight: 'bold',
    },
    legend: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 24px 4px',
        gap: '0',
        flexShrink: 0,
        borderBottom: '1px solid #0f172a',
    },
    columns: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    col: {
        flex: 1,
        padding: '16px 20px',
        borderRight: '1px solid #1e293b',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    portraitRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px',
    },
    portrait: {
        width: '56px',
        height: '56px',
        border: '1px solid #334155',
        borderRadius: '6px',
        background: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0,
    },
    heroName: { fontSize: '13px', fontWeight: 'bold', color: '#e2e8f0' },
    heroStats: { fontSize: '10px', color: '#64748b', marginTop: '3px' },
    chevron: { fontSize: '18px', color: '#475569', textAlign: 'center', margin: '4px 0 8px' },
    rulesWrap: { display: 'flex', flexDirection: 'column', gap: '0' },
    emptyRules: {
        color: '#334155',
        fontSize: '11px',
        textAlign: 'center',
        padding: '24px 0',
        border: '1px dashed #1e293b',
        borderRadius: '6px',
        marginBottom: '8px',
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '10px',
        background: 'transparent',
        border: '1px dashed #334155',
        borderRadius: '6px',
        color: '#475569',
        cursor: 'pointer',
        fontFamily: font,
        fontSize: '11px',
        marginTop: '4px',
    },
    miniBtn: {
        background: 'transparent',
        border: '1px solid #1e293b',
        color: '#64748b',
        padding: '3px 8px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontFamily: font,
        fontSize: '10px',
        whiteSpace: 'nowrap',
    },
    footer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderTop: '1px solid #1e293b',
        background: 'rgba(15,23,42,0.8)',
        flexShrink: 0,
    },
    key: {
        padding: '2px 6px',
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '3px',
        fontSize: '10px',
        fontFamily: font,
        color: '#94a3b8',
        fontStyle: 'normal',
    },
    footerBtn: {
        background: 'transparent',
        border: 'none',
        color: '#94a3b8',
        fontFamily: font,
        fontSize: '11px',
        cursor: 'pointer',
        padding: 0,
    },
    footerLabel: { fontSize: '11px', color: '#94a3b8' },
};
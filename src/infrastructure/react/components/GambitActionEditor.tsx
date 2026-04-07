import React, { useState, useEffect } from 'react';
import { gameStore } from '@infra/bridge/GameStore';
import { useGameStore } from '@infra/react/hooks/useGameStore';
import { ActionType, SpellTargetType, type AutomationRule, type SpellDefinition } from '@domain/shared/types';
import {
  ACTION_CATEGORIES,
  GENERIC_ACTIONS,
  entriesForCategory,
  entryId,
  entryName,
  type ActionEntry,
  type GenericActionDef,
} from '@domain/shared/actionConfig';

// ─── Helpers ─────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 8); }

function targetLabel(t: SpellTargetType): string {
  switch (t) {
    case SpellTargetType.Self:   return 'Soi-même';
    case SpellTargetType.Single: return 'Cible unique';
    case SpellTargetType.Area:   return 'Zone';
    case SpellTargetType.Line:   return 'Ligne';
    default: return t;
  }
}

function entryToAction(entry: ActionEntry): { type: ActionType; params: Record<string, string> } {
  if (entry.kind === 'generic') {
    return { type: entry.generic.actionType, params: {} };
  }
  return { type: ActionType.CastSpell, params: { spellId: entry.spell.id } };
}

function currentEntryId(rule: AutomationRule | null): string | null {
  if (!rule) return null;
  if (rule.action.type === ActionType.CastSpell) return rule.action.params['spellId'] ?? null;
  const gen = GENERIC_ACTIONS.find(g => g.actionType === rule.action.type);
  return gen?.id ?? null;
}

// ─── CategoryIcon ────────────────────────────────────────────

function CategoryIcon({ id, size = 24 }: { id: string; size?: number }) {
  const s = { width: size, height: size };
  const icons: Record<string, React.ReactNode> = {
    attack: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M14.5 3.5L20.5 9.5L9 21L3 21L3 15L14.5 3.5Z"/>
        <line x1="11" y1="6.5" x2="17.5" y2="13"/>
      </svg>
    ),
    defense: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M12 3L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 3Z"/>
      </svg>
    ),
    heal: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M12 21C12 21 4 14.5 4 9A4 4 0 0 1 12 7.2A4 4 0 0 1 20 9C20 14.5 12 21 12 21Z"/>
      </svg>
    ),
    boost: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/>
      </svg>
    ),
    generic: (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  };
  return <>{icons[id] ?? icons.generic}</>;
}

// ─── ActionCard ──────────────────────────────────────────────

function ActionCard({ entry, isSelected, onHover, onClick }: {
  entry: ActionEntry;
  isSelected: boolean;
  onHover: (e: ActionEntry | null) => void;
  onClick: (e: ActionEntry) => void;
}) {
  const name = entryName(entry);
  return (
    <button
      style={{
        ...S.actionCard,
        ...(isSelected ? S.actionCardSelected : {}),
      }}
      onMouseEnter={() => onHover(entry)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(entry)}
    >
      <div style={S.actionCardImg}>
        {/* Placeholder image — remplacer par <img src={...}/> quand assets dispo */}
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9l4-4 4 4 4-4 4 4"/>
          <path d="M3 15l4 4 4-4 4 4 4-4"/>
        </svg>
      </div>
      <span style={S.actionCardLabel}>{name}</span>
      {isSelected && <div style={S.actionCardCheck}>✓</div>}
    </button>
  );
}

// ─── ActionDetail ────────────────────────────────────────────

function ActionDetail({ entry }: { entry: ActionEntry }) {
  const isSpell = entry.kind === 'spell';
  const spell   = isSpell ? entry.spell : null;
  const generic = !isSpell ? entry.generic : null;
  const name    = entryName(entry);
  const cost    = spell?.cost ?? generic?.cost ?? 0;
  const tgt     = targetLabel(spell?.targetType ?? generic?.targetType ?? SpellTargetType.Self);
  const desc    = spell?.description ?? generic?.description ?? '';
  const effects = spell?.effects ?? generic?.effects ?? [];

  // Catégorie label
  const catId  = spell?.category ?? 'generic';
  const catCfg = ACTION_CATEGORIES.find(c => c.id === catId);

  return (
    <div style={S.detail}>
      <div style={S.detailHeader}>
        <div style={S.detailImg}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#a78bfa" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9l4-4 4 4 4-4 4 4"/>
          </svg>
        </div>
        <div>
          <div style={S.detailName}>{name}</div>
          <div style={S.detailCat}>
            <CategoryIcon id={catId} size={13} />
            <span>{catCfg?.label ?? catId}</span>
          </div>
        </div>
      </div>

      <div style={S.detailMeta}>
        <span>Coût : <strong>{cost} énergie</strong> ⚡</span>
        <span>Cible : <strong>{tgt}</strong> {tgt === 'Zone' ? '✦' : tgt === 'Soi-même' ? '◎' : '↗'}</span>
        {spell?.cooldown ? <span>Recharge : <strong>{spell.cooldown} tour{spell.cooldown > 1 ? 's' : ''}</strong></span> : null}
        {spell?.range    ? <span>Portée : <strong>{spell.range} case{spell.range > 1 ? 's' : ''}</strong></span> : null}
      </div>

      {effects.length > 0 && (
        <>
          <div style={S.detailEffectsTitle}>Effets</div>
          {effects.map((e, i) => (
            <div key={i} style={S.detailEffect}>
              <span style={S.detailEffectIcon}>
                {catId === 'heal' ? '♥' : catId === 'defense' ? '◎' : catId === 'boost' ? '↑' : '⚡'}
              </span>
              {e.label}
            </div>
          ))}
        </>
      )}

      {desc && <div style={S.detailDesc}>{desc}</div>}
    </div>
  );
}

// ─── GambitSummary ────────────────────────────────────────────

function GambitSummary({ rule, hoveredEntry, selectedEntry }: {
  rule: AutomationRule | null;
  hoveredEntry: ActionEntry | null;
  selectedEntry: ActionEntry | null;
}) {
  const condText = rule?.conditions?.length
    ? rule.conditions.map((b: any) => b.conditions?.map((c: any) => c.value?.label).join(' ET ')).join(' OU ')
    : '—';

  const actionText = selectedEntry
    ? entryName(selectedEntry)
    : rule?.action.type === ActionType.CastSpell
      ? rule.action.params['spellId'] ?? '—'
      : rule?.action.type ?? '— (à définir)';

  const targetText = rule?.target?.blocks?.length
    ? rule.target.blocks.map((b: any) => b.targetKind).join(' OU ')
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
        <span style={S.summaryText}>{actionText}</span>
      </div>
      <div style={S.summaryRow}>
        <span style={S.summaryTag}>⊕</span>
        <span style={{ ...S.summaryText, opacity: 0.5 }}>{targetText}</span>
      </div>
    </div>
  );
}

// ─── FlowBar ─────────────────────────────────────────────────
// La barre Condition → Action → Cible en haut à droite

function FlowBar({ rule, activeStep }: { rule: AutomationRule | null; activeStep: 'action' }) {
  const hasCondition = (rule?.conditions?.length ?? 0) > 0;
  const hasAction    = rule?.action?.type && rule.action.type !== ActionType.PassTurn;
  const hasTarget    = (rule?.target?.blocks?.length ?? 0) > 0;

  return (
    <div style={S.flowBar}>
      <FlowNode icon="?" active={false} done={hasCondition} />
      <div style={S.flowArrow}>→</div>
      <FlowNode icon="⚡" active={true} done={false} />
      <div style={S.flowArrow}>→</div>
      <FlowNode icon="◎" active={false} done={hasTarget} />
    </div>
  );
}

function FlowNode({ icon, active, done }: { icon: string; active: boolean; done?: boolean }) {
  return (
    <div style={{
      ...S.flowNode,
      ...(active ? S.flowNodeActive : {}),
      ...(done ? S.flowNodeDone : {}),
    }}>
      {icon}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════

export function GambitActionEditor(): React.ReactElement {
  const store = useGameStore();
  const heroIdx      = store.editingHeroIndex ?? 0;
  const hero         = gameStore.playerParty[heroIdx] ?? null;
  const existingRule = hero?.automations.find(r => r.id === store.editingRuleId) ?? null;

  const [selectedCat,   setSelectedCat]   = useState(ACTION_CATEGORIES[0].id);
  const [hoveredEntry,  setHoveredEntry]   = useState<ActionEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<ActionEntry | null>(null);

  // Init : pré-sélectionner l'action existante
  useEffect(() => {
    if (!existingRule) { setSelectedEntry(null); return; }

    const existingId = currentEntryId(existingRule);
    if (!existingId) { setSelectedEntry(null); return; }

    // Chercher dans les sorts du héros
    const spell = hero?.spells.find(s => s.id === existingId);
    if (spell) {
      setSelectedEntry({ kind: 'spell', spell });
      setSelectedCat(spell.category);
      return;
    }
    // Chercher dans les génériques
    const gen = GENERIC_ACTIONS.find(g => g.id === existingId);
    if (gen) {
      setSelectedEntry({ kind: 'generic', generic: gen });
      setSelectedCat('generic');
    }
  }, [store.editingRuleId]);

  const entries       = entriesForCategory(selectedCat, hero?.spells ?? []);
  const displayEntry  = hoveredEntry ?? selectedEntry; // fiche = hover prioritaire, sinon sélection

  const handleConfirm = () => {
    if (!hero || !selectedEntry || !existingRule) return;
    const party = [...store.playerParty];
    const updatedHero = { ...hero, automations: [...hero.automations] };
    const ruleIdx = updatedHero.automations.findIndex(r => r.id === existingRule.id);
    if (ruleIdx !== -1) {
      updatedHero.automations[ruleIdx] = {
        ...existingRule,
        action: entryToAction(selectedEntry),
      };
    }
    party[heroIdx] = updatedHero;
    gameStore.setPlayerParty(party);
    gameStore.notifyPartyUpdate();
    gameStore.clearEditing();
    gameStore.goToScreen('party-setup');
  };

  const handleBack = () => {
    gameStore.clearEditing();
    gameStore.goToScreen('party-setup');
  };

  const crumbs = [
    `Gambit "${existingRule?.name ?? '???'}"`,
    'Choisir une action',
  ];

  return (
    <div style={S.root}>
      {/* ── HEADER ─────────────────────────────── */}
      <div style={S.header}>
        <span style={S.breadcrumb}>{crumbs.join(' > ')}</span>
        <FlowBar rule={existingRule} activeStep="action" />
        <GambitSummary rule={existingRule} hoveredEntry={hoveredEntry} selectedEntry={selectedEntry} />
      </div>

      <div style={S.divider} />

      {/* ── BODY ───────────────────────────────── */}
      <div style={S.body}>

        {/* Catégories — colonne gauche */}
        <div style={S.catCol}>
          {ACTION_CATEGORIES.map(cat => {
            const count = entriesForCategory(cat.id, hero?.spells ?? []).length;
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                style={{ ...S.catItem, ...(isActive ? S.catItemActive : {}) }}
                onClick={() => setSelectedCat(cat.id)}
              >
                <div style={{ color: isActive ? '#fff' : '#a78bfa', flexShrink: 0 }}>
                  <CategoryIcon id={cat.id} size={20} />
                </div>
                <span style={S.catItemLabel}>{cat.label}</span>
                {count > 0 && (
                  <span style={{ ...S.catCount, ...(isActive ? S.catCountActive : {}) }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grille d'actions — centre */}
        <div style={S.gridCol}>
          {entries.length === 0 ? (
            <div style={S.gridEmpty}>Aucune action disponible dans cette catégorie</div>
          ) : (
            <div style={S.grid}>
              {entries.map(entry => (
                <ActionCard
                  key={entryId(entry)}
                  entry={entry}
                  isSelected={selectedEntry ? entryId(selectedEntry) === entryId(entry) : false}
                  onHover={setHoveredEntry}
                  onClick={setSelectedEntry}
                />
              ))}
            </div>
          )}
        </div>

        {/* Flèche séparatrice */}
        {displayEntry && <div style={S.detailArrow}>{'>>'}</div>}

        {/* Fiche détail — droite */}
        <div style={S.detailCol}>
          {displayEntry
            ? <ActionDetail entry={displayEntry} />
            : <div style={S.detailEmpty}>Survole ou sélectionne une action pour voir sa description</div>
          }
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────── */}
      <div style={S.footer}>
        <kbd style={S.key}>ESC</kbd>
        <button style={S.footerBtn} onClick={handleBack}>Back</button>
        <span style={{ flex: 1 }} />
        {selectedEntry && (
          <button style={S.confirmBtn} onClick={handleConfirm}>
            ✓ Confirmer l'action
          </button>
        )}
        <kbd style={S.key}>ENTER</kbd>
        <span style={S.footerLabel}>Select</span>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const font   = '"JetBrains Mono", monospace';
const purple = '#7c3aed';
const purpleLight = '#c8c4e8';

const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column', height: '100%',
    fontFamily: font, color: '#e2e8f0', background: purpleLight, overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '14px 20px 10px', flexShrink: 0, gap: '16px',
  },
  breadcrumb: { fontSize: '13px', fontWeight: 'bold', color: '#3b1f6e', paddingTop: '4px' },

  // Flow bar
  flowBar: { display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px' },
  flowNode: {
    width: '44px', height: '44px', border: '1px solid rgba(180,160,220,0.4)',
    borderRadius: '6px', background: 'rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', color: '#9f7aea',
  },
  flowNodeActive: {
    border: `2px solid ${purple}`, background: 'rgba(124,58,237,0.15)', color: purple,
  },
  flowNodeDone: {
    border: '1px solid rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.08)', color: '#a78bfa',
  },
  flowArrow: { color: 'rgba(124,58,237,0.4)', fontSize: '18px' },

  // Summary
  summary: {
    background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '8px', padding: '8px 14px', minWidth: '200px',
    display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0,
  },
  summaryTitle: { fontSize: '9px', color: '#5b2d9e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' },
  summaryRow: { display: 'flex', gap: '8px', alignItems: 'baseline' },
  summaryTag: { fontSize: '9px', color: '#7c5cbf', minWidth: '14px', flexShrink: 0 },
  summaryText: { fontSize: '10px', color: '#2d1b5e', fontFamily: font },

  divider: { height: '1px', background: 'rgba(100,80,180,0.2)', flexShrink: 0 },

  // Body layout
  body: {
    flex: 1, overflow: 'hidden', display: 'flex',
    flexDirection: 'row', gap: '0', padding: '0',
  },

  // Catégories
  catCol: {
    width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column',
    gap: '4px', padding: '16px 12px', borderRight: '1px solid rgba(100,80,180,0.15)',
    overflowY: 'auto',
  },
  catItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 14px', background: 'rgba(255,255,255,0.35)',
    border: '1px solid rgba(255,255,255,0.5)', borderRadius: '8px',
    cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
  },
  catItemActive: {
    background: purple, border: `1px solid ${purple}`,
  },
  catItemLabel: { fontSize: '13px', fontWeight: 'bold', color: 'inherit', flex: 1 },
  catCount: {
    fontSize: '10px', background: 'rgba(124,58,237,0.15)',
    color: '#7c5cbf', borderRadius: '10px', padding: '1px 6px',
  },
  catCountActive: { background: 'rgba(255,255,255,0.2)', color: '#fff' },

  // Grille
  gridCol: {
    flex: 1, overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  gridEmpty: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#9f7aea', fontSize: '12px', fontStyle: 'italic',
  },
  actionCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    padding: '12px 8px', background: 'rgba(255,255,255,0.35)',
    border: '1px solid rgba(255,255,255,0.5)', borderRadius: '8px',
    cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
    position: 'relative',
  },
  actionCardSelected: {
    background: 'rgba(124,58,237,0.15)', border: `2px solid ${purple}`,
  },
  actionCardImg: {
    width: '72px', height: '72px', background: 'rgba(255,255,255,0.4)',
    border: '1px solid rgba(180,160,220,0.4)', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9f7aea',
  },
  actionCardLabel: { fontSize: '11px', fontWeight: 'bold', color: '#2d1b5e', textAlign: 'center' },
  actionCardCheck: {
    position: 'absolute', top: '6px', right: '6px',
    width: '16px', height: '16px', background: purple,
    borderRadius: '50%', color: '#fff', fontSize: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // Détail
  detailArrow: {
    color: '#9f7aea', fontSize: '14px', padding: '0 8px',
    alignSelf: 'center', flexShrink: 0,
  },
  detailCol: {
    width: '260px', flexShrink: 0, padding: '16px 12px',
    borderLeft: '1px solid rgba(100,80,180,0.15)', overflowY: 'auto',
  },
  detailEmpty: {
    color: '#9f7aea', fontSize: '11px', fontStyle: 'italic',
    textAlign: 'center', marginTop: '40px', lineHeight: 1.6,
  },
  detail: { display: 'flex', flexDirection: 'column', gap: '12px' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  detailImg: {
    width: '52px', height: '52px', flexShrink: 0,
    background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(180,160,220,0.4)',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  detailName: { fontSize: '16px', fontWeight: 'bold', color: '#2d1b5e' },
  detailCat: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#7c5cbf', marginTop: '2px',
  },
  detailMeta: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    fontSize: '12px', color: '#3b1f6e', lineHeight: 1.6,
  },
  detailEffectsTitle: { fontSize: '11px', color: '#5b2d9e', textTransform: 'uppercase', letterSpacing: '0.06em' },
  detailEffect: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', color: '#2d1b5e',
  },
  detailEffectIcon: { color: purple, fontSize: '12px', flexShrink: 0 },
  detailDesc: {
    fontSize: '11px', color: '#6d5a9e', fontStyle: 'italic',
    lineHeight: 1.6, borderTop: '1px solid rgba(124,58,237,0.15)', paddingTop: '10px',
  },

  // Footer
  footer: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
    borderTop: '1px solid rgba(180,160,220,0.3)', flexShrink: 0,
    background: 'rgba(200,196,232,0.8)',
  },
  key: {
    padding: '2px 6px', background: 'rgba(255,255,255,0.3)',
    border: '1px solid rgba(180,160,220,0.4)', borderRadius: '3px',
    fontSize: '10px', fontFamily: font, color: '#3b1f6e', fontStyle: 'normal',
  },
  footerBtn: {
    background: 'transparent', border: 'none', color: '#5b2d9e',
    fontFamily: font, fontSize: '11px', cursor: 'pointer', padding: 0,
  },
  confirmBtn: {
    padding: '7px 18px', background: purple, color: '#fff', border: 'none',
    borderRadius: '5px', cursor: 'pointer', fontFamily: font, fontSize: '11px', fontWeight: 'bold',
  },
  footerLabel: { fontSize: '11px', color: '#5b2d9e' },
};
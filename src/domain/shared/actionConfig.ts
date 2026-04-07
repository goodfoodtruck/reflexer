import { ActionType, SpellTargetType, type SpellDefinition } from './types';

export type ActionCategory = {
  id: string;
  label: string;
  icon: string;   // caractère SVG path ou emoji pour l'icône de catégorie
};

// ─── Catégories fixes ─────────────────────────────────────────

export const ACTION_CATEGORIES: ActionCategory[] = [
  { id: 'attack',  label: 'Attaque',  icon: 'sword'  },
  { id: 'defense', label: 'Défense',  icon: 'shield' },
  { id: 'heal',    label: 'Soin',     icon: 'heart'  },
  { id: 'boost',   label: 'Boost',    icon: 'arrow'  },
  { id: 'generic', label: 'Général',  icon: 'gear'   },
];

// ─── Actions génériques (pas des sorts) ───────────────────────
// Représentées comme des SpellDefinition-like pour uniformiser l'UI

export interface GenericActionDef {
  id: string;
  actionType: ActionType;   // le type à écrire dans AutomationAction
  category: 'generic';
  name: string;
  description: string;
  cost: number;
  effects: { label: string }[];
  targetType: SpellTargetType;
}

export const GENERIC_ACTIONS: GenericActionDef[] = [
  {
    id: 'generic_defend',
    actionType: ActionType.Defend,
    category: 'generic',
    name: 'Défendre',
    description: 'Le héros prend une posture défensive jusqu\'à son prochain tour.',
    cost: 0,
    effects: [{ label: '+50% DEF ce tour' }],
    targetType: SpellTargetType.Self,
  },
  {
    id: 'generic_flee',
    actionType: ActionType.Flee,
    category: 'generic',
    name: 'Fuir',
    description: 'Tente de quitter le combat. Échoue si encerclé.',
    cost: 0,
    effects: [{ label: 'Quitte le combat' }],
    targetType: SpellTargetType.Self,
  },
  {
    id: 'generic_pass',
    actionType: ActionType.PassTurn,
    category: 'generic',
    name: 'Passer le tour',
    description: 'Ne fait rien ce tour. Récupère légèrement.',
    cost: 0,
    effects: [{ label: '+5% énergie récupérée' }],
    targetType: SpellTargetType.Self,
  },
  {
    id: 'generic_move',
    actionType: ActionType.Move,
    category: 'generic',
    name: 'Se déplacer',
    description: 'Se déplace vers la position optimale selon la cible.',
    cost: 1,
    effects: [{ label: 'Repositionnement tactique' }],
    targetType: SpellTargetType.Self,
  },
];

// ─── Type unifié pour l'UI ────────────────────────────────────

export type ActionEntry =
  | { kind: 'spell';   spell: SpellDefinition }
  | { kind: 'generic'; generic: GenericActionDef };

export function entryId(e: ActionEntry): string {
  return e.kind === 'spell' ? e.spell.id : e.generic.id;
}

export function entryName(e: ActionEntry): string {
  return e.kind === 'spell' ? e.spell.name : e.generic.name;
}

// Retourne les entrées pour une catégorie donnée,
// en filtrant les sorts du héros par category
export function entriesForCategory(
  categoryId: string,
  heroSpells: SpellDefinition[]
): ActionEntry[] {
  if (categoryId === 'generic') {
    return GENERIC_ACTIONS.map(g => ({ kind: 'generic', generic: g }));
  }
  return heroSpells
    .filter(s => s.category === categoryId)
    .map(s => ({ kind: 'spell', spell: s }));
}
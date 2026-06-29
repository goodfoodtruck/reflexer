/**
 * Fonctions de traduction "moteur → texte lisible".
 * Tout ce qui est affiché dans GambitRow, GambitInspector, actionCatalog passe ici.
 * L'adapter (gambit.adapter.ts) ne contient que de la conversion de données, pas d'affichage.
 */
import type { AnyFilter } from '@reflexer/engine';
import { rangeRelationLabel } from './filters/rangeRelations';
import { rangeToLabel } from './filters/rangeFilters';
import { sortToLabel, sortLabelToSort } from './sorts/sortRegistry';

export { sortToLabel, sortLabelToSort };

/* ────────────────────────────────────────────────────────────────────────────
 * Passifs
 * ────────────────────────────────────────────────────────────────────────── */

export const STATUS_OPTIONS = [
  { passiveId: 'bleed',      label: 'SAIGNEMENT' },
  { passiveId: 'vulnerable', label: 'VULNÉRABLE' },
  { passiveId: 'thorns',     label: 'ÉPINES' },
] as const;

export const passiveIdToStatusLabel = (passiveId: string): string =>
  STATUS_OPTIONS.find((s) => s.passiveId === passiveId)?.label ?? passiveId;

export const statusLabelToPassiveId = (label: string): string | null =>
  STATUS_OPTIONS.find((s) => s.label === label)?.passiveId ?? null;

/* ────────────────────────────────────────────────────────────────────────────
 * Filtre moteur → libellé lisible
 * Ajouter un filtre ici quand on en ajoute un dans entityFilters.types.ts.
 * ────────────────────────────────────────────────────────────────────────── */

export const filterToLabel = (filter: AnyFilter): string => {
  switch (filter.type) {
    case 'HP_BELOW':     return `PV < ${filter.threshold}%`;
    case 'HP_ABOVE':     return `PV > ${filter.threshold}%`;
    case 'ARMOR_BELOW':  return `ARMURE < ${filter.threshold}%`;
    case 'ARMOR_ABOVE':  return `ARMURE > ${filter.threshold}%`;
    case 'ENERGY_BELOW': return `ÉNERGIE < ${filter.threshold}%`;
    case 'ENERGY_ABOVE': return `ÉNERGIE > ${filter.threshold}%`;
    case 'HAS_PASSIVE':  return `PASSIF : ${passiveIdToStatusLabel(filter.passiveId)}`;
    case 'IN_RANGE':     return rangeToLabel(filter.range);
    case 'CHARACTER_IN_RANGE_OF_ANOTHER':
    case 'CHARACTER_IN_RANGE_OF_ENEMY':
    case 'ENEMY_IN_RANGE_OF_CHARACTER':
    case 'ENEMY_IN_RANGE_OF_ANOTHER':
      return `${rangeRelationLabel(filter.type)} (${rangeToLabel(filter.range)})`;
    default: {
      const _exhaustive: never = filter;
      void _exhaustive;
      return (filter as { type: string }).type;
    }
  }
};

import type { ReactNode } from 'react';
import { ACTION_CATALOG, MOCK_PASSIVES } from '@reflexer/engine';
import type {
  Action,
  CheckEnergyProcessorParams,
  ComputeDamageProcessorParams,
  ComputeHealProcessorParams,
  PassiveProcessorParams
} from '@reflexer/engine';
import type { ActionCategory, ActionItem } from './GambitTypes';
import { passiveIdToStatusLabel } from './display';
import { resolveActionIconUrl } from '@features/fight/replay/action-assets';
import { AttackIcon } from '@assets/icons/IconAttack';
import { DefenseIcon } from '@assets/icons/IconDefense';
import { HealIcon } from '@assets/icons/IconHeal';
import { MovementIcon } from '@assets/icons/IconMovement';
import { BoostIcon } from '@assets/icons/IconBoost';

/**
 * Catalogue d'actions de l'éditeur de gambits, **entièrement dérivé de la donnée
 * moteur** (`ACTION_CATALOG` ⟵ `json/actions.json`). Le moteur est la source de
 * vérité unique :
 *  - quelles actions proposer : tout sauf les actions **internes** (déclenchées
 *    par un passif, ex. `bleed_tick`/`thorns_tick`) — déduit de `MOCK_PASSIVES` ;
 *  - le **coût** et les **effets** : lus dans les `processorConfigs`, jamais
 *    dupliqués (le coût n'apparaît que si l'action porte un processor d'énergie).
 *  - l'`id` est l'identifiant moteur réel → le gambit sauvegardé porte un
 *    `actionId` que le moteur sait résoudre.
 *
 * Seuls `category` (regroupement) et `description` (texte) sont des métadonnées
 * éditoriales portées par la donnée. La catégorie « Mouvement » est l'exception :
 * ce ne sont pas des actions mais des `GambitIntent` MOVEMENT (`strategy`).
 */

/** Ids des actions internes : référencées comme action déclenchée d'un passif. */
const INTERNAL_ACTION_IDS = new Set(
  Object.values(MOCK_PASSIVES).flatMap((passive) =>
    passive.kind === 'TRIGGERED' ? [passive.triggeredActionId] : []
  )
);

/** Coût en énergie dérivé du processor `check_energy`, ou `undefined` si l'action est gratuite. */
function deriveCost(action: Action): number | undefined {
  const checkEnergy = action.processorConfigs.find((config) => config.type === 'check_energy');
  return checkEnergy ? (checkEnergy.params as CheckEnergyProcessorParams).neededEnergy : undefined;
}

/** Résumé d'effets dérivé des processors (dégâts / soin / statut appliqué). */
function deriveEffect(action: Action): string | undefined {
  const parts = [...action.processorConfigs]
    .sort((a, b) => a.order - b.order)
    .flatMap((config): string[] => {
      switch (config.type) {
        case 'compute_damage':
          return [`${(config.params as ComputeDamageProcessorParams).initialDamage} dégâts`];
        case 'compute_heal':
          return [`+${(config.params as ComputeHealProcessorParams).healAmount} soin`];
        case 'passive': {
          const { passiveId, duration } = config.params as PassiveProcessorParams;
          const label = passiveIdToStatusLabel(passiveId);
          return [duration === 'PERMANENT' ? `${label} (permanent)` : `${label} (${duration} tours)`];
        }
        default:
          return [];
      }
    });
  return parts.length ? parts.join(' + ') : undefined;
}

/** Icône de catégorie par libellé (avec repli). */
const CATEGORY_ICON: Record<string, ReactNode> = {
  Attaque: <AttackIcon className="w-5 h-5" />,
  Défense: <DefenseIcon className="w-5 h-5" />,
  Soin: <HealIcon className="w-5 h-5" />,
  Boost: <BoostIcon className="w-5 h-5" />,
  Malus: <DefenseIcon className="w-5 h-5" />
};

const categoryIcon = (name: string): ReactNode =>
  CATEGORY_ICON[name] ?? <AttackIcon className="w-5 h-5" />;

/** "Attaque" -> "cat_attaque" : id de catégorie stable et lisible. */
const categorySlug = (name: string): string =>
  'cat_' +
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');

const toItem = (action: Action): ActionItem => ({
  id: action.id,
  name: action.name ?? action.id,
  description: action.description ?? '',
  kind: 'ACTION',
  image: action.icon ? resolveActionIconUrl(action.icon) ?? undefined : undefined,
  cost: deriveCost(action),
  effect: deriveEffect(action)
});

/** Groupe les actions sélectionnables (= non internes) par catégorie, ordre d'apparition préservé. */
function buildActionCategories(): ActionCategory[] {
  const byCategory = new Map<string, ActionItem[]>();
  for (const action of ACTION_CATALOG) {
    if (INTERNAL_ACTION_IDS.has(action.id)) continue;
    const category = action.category ?? 'Autres';
    const items = byCategory.get(category) ?? [];
    items.push(toItem(action));
    byCategory.set(category, items);
  }

  return [...byCategory.entries()].map(([name, items]) => ({
    id: categorySlug(name),
    name,
    icon: categoryIcon(name),
    items
  }));
}

/** Pseudo-catégorie Mouvement : intentions MOVEMENT (strategy), pas des actions moteur. */
const MOVEMENT_CATEGORY: ActionCategory = {
  id: 'cat_mouvement',
  name: 'Mouvement',
  icon: <MovementIcon className="w-5 h-5" />,
  items: [
    {
      id: 'FLEE',
      name: 'Fuite',
      kind: 'MOVEMENT',
      image: resolveActionIconUrl('mouvement/Flee.png') ?? undefined,
      description: "S'éloigne au maximum de la cible sélectionnée par le Target Selector."
    },
    {
      id: 'APPROACH',
      name: 'Chargez !',
      kind: 'MOVEMENT',
      image: resolveActionIconUrl('mouvement/Charge.png') ?? undefined,
      description: 'Se rapproche de la cible sélectionnée par le Target Selector.'
    },
    {
      id: 'STAY',
      name: 'Tenir la position',
      kind: 'MOVEMENT',
      image: resolveActionIconUrl('mouvement/Teleport.png') ?? undefined,
      description: 'Reste sur place, sans se déplacer ce tour-ci.'
    }
  ]
};

export const ACTION_CATEGORIES: ActionCategory[] = [
  ...buildActionCategories(),
  MOVEMENT_CATEGORY
];

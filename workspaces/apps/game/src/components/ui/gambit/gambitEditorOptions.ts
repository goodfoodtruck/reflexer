import { STATUS_OPTIONS } from './gambit.adapter';

/**
 * Options purement éditeur (libellés présentés au joueur dans les étapes de
 * création de gambit). Ce ne sont pas des données moteur — contrairement au
 * catalogue d'actions, voir `actionCatalog.tsx`. Les statuts sont toutefois
 * dérivés de `STATUS_OPTIONS` (passifs réellement définis dans le moteur).
 */

export const INSPIRATIONS = [
  "Soin d'urgence",
  'Sortie tactique',
  'Coup de grâce',
  'Riposte',
  'Premier sang',
  'Embuscade'
];

// Les options proposées sont restreintes à ce que le moteur sait évaluer
// (HP_BELOW / HP_ABOVE / HAS_PASSIVE / IN_RANGE) — voir gambit.adapter.ts
const STATUS_LABELS = STATUS_OPTIONS.map((s) => s.label);

export const CRITERIA_DATA_CONDITION_STEP = [
  { id: 'status', label: 'Status', options: STATUS_LABELS },
  {
    id: 'health',
    label: 'Health',
    options: ['PV < 25%', 'PV < 50%', 'PV < 75%', 'PV < 100%', 'PV > 25%', 'PV > 50%']
  },
  {
    id: 'distance_enemy',
    label: "Distance d'un ennemi",
    options: ['FAIBLE DISTANCE', 'MOYENNE DISTANCE', 'LONGUE DISTANCE']
  },
  {
    id: 'distance_character',
    label: "Distance d'un allié",
    options: ['FAIBLE DISTANCE', 'MOYENNE DISTANCE', 'LONGUE DISTANCE']
  }
];

export const FILTER_CATEGORIES = [
  { id: 'health', label: 'Santé', options: ['PV < 25%', 'PV < 50%', 'PV > 50%'] },
  { id: 'status', label: 'Statut', options: STATUS_LABELS }
];

export const SORT_CATEGORIES = [
  { id: 'distance_me', label: 'Distance de moi', options: ['LE PLUS PROCHE', 'LE PLUS ÉLOIGNÉ'] },
  { id: 'health_val', label: 'Santé', options: ['LES PLUS ÉLEVÉS', 'LES MOINS ÉLEVÉS'] }
];

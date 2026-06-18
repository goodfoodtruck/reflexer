import { STATUS_OPTIONS } from './gambit.adapter';

export const INSPIRATIONS = [
  "Soin d'urgence", 'Sortie tactique', 'Coup de grâce', 'Riposte', 'Premier sang', 'Embuscade'
];

const STATUS_LABELS = STATUS_OPTIONS.map((s) => s.label);
const RANGE_OPTIONS = ['À COURTE PORTÉE', 'À MOYENNE PORTÉE', 'À LONGUE PORTÉE'];

const STAT_CATEGORIES = [
  { id: 'status', label: 'Passifs', options: STATUS_LABELS },
  { id: 'health', label: 'Santé',
    options: ['PV < 25%', 'PV < 50%', 'PV < 75%', 'PV < 100%', 'PV > 25%', 'PV > 50%', 'PV > 75%'] },
  { id: 'armor', label: 'Armure',
    options: ['ARMURE < 5%', 'ARMURE < 10%', 'ARMURE < 15%', 'ARMURE < 20%', 'ARMURE < 25%', 'ARMURE > 25%', 'ARMURE > 50%', 'ARMURE > 75%'] },
  { id: 'energy', label: 'Énergie',
    options: ['ÉNERGIE < 25%', 'ÉNERGIE < 50%', 'ÉNERGIE < 75%', 'ÉNERGIE < 100%', 'ÉNERGIE > 25%', 'ÉNERGIE > 50%', 'ÉNERGIE > 75%'] },
] as const;

/** Catégories proposées à l'étape « conditions » — inclut les relations de portée */
export const FILTER_CATEGORIES = [
  ...STAT_CATEGORIES,
  { id: 'in_range_of_ally',  label: "À portée d'un allié",  options: RANGE_OPTIONS },
  { id: 'in_range_of_enemy', label: "À portée d'un ennemi", options: RANGE_OPTIONS },
];

/** Catégories proposées à l'étape « filtres de cible » — pas de relation, la cible est déjà ciblée */
export const TARGET_FILTER_CATEGORIES = [...STAT_CATEGORIES];

export const SORT_CATEGORIES = [
  { id: 'distance_me', label: 'Distance de moi',
    options: ['LE PLUS PROCHE', 'LE PLUS ÉLOIGNÉ'] },
  { id: 'distance_character', label: "Distance d'un allié",
    options: ["LE PLUS PROCHE D'UN ALLIÉ", "LE PLUS ÉLOIGNÉ D'UN ALLIÉ"] },
  { id: 'distance_enemy', label: "Distance d'un ennemi",
    options: ["LE PLUS PROCHE D'UN ENNEMI", "LE PLUS ÉLOIGNÉ D'UN ENNEMI"] },
  { id: 'health', label: 'Santé',
    options: ['LA PLUS ÉLEVÉE', 'LA MOINS ÉLEVÉE'] },
  { id: 'energy', label: 'Énergie',
    options: ["LE PLUS D'ÉNERGIE", "LE MOINS D'ÉNERGIE"] },
  { id: 'armor', label: 'Armure',
    options: ["LE PLUS D'ARMURE", "LE MOINS D'ARMURE"] }
];
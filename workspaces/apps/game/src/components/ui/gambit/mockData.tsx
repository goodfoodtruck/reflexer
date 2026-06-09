import type { ActionCategory } from './GambitTypes';
import imgBouleFeu from '../../../assets/images/actions/attaque/Boule-feu.png';
import imgAttaqueCinglante from '../../../assets/images/actions/attaque/Attaque-Cinglant.png';
import imgBarricade from '../../../assets/images/actions/défense/Barricade.png';
import imgRenforts from '../../../assets/images/actions/soin/Renforts.png';
import imgSoinsPalliatifs from '../../../assets/images/actions/soin/Soins palliatifs.png';
import imgFlee from '../../../assets/images/actions/mouvement/Flee.png';
import imgCharge from '../../../assets/images/actions/mouvement/Charge.png';
import imgTeleport from '../../../assets/images/actions/mouvement/Teleport.png';
import imgBenediction from '../../../assets/images/actions/boost/Bénédiction-du-magicien.png';
import imgForceTerre from '../../../assets/images/actions/boost/Force-de-la-Terre.png';
import { AttackIcon } from '../../../assets/icons/IconAttack';
import { DefenseIcon } from '../../../assets/icons/IconDefense';
import { HealIcon } from '../../../assets/icons/IconHeal';
import { MovementIcon } from '../../../assets/icons/IconMovement';
import { BoostIcon } from '../../../assets/icons/IconBoost';

export const INSPIRATIONS = [
  "Soin d'urgence",
  'Sortie tactique',
  'Coup de grâce',
  'Riposte',
  'Premier sang',
  'Embuscade'
];

export const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'cat_attaque',
    name: 'Attaque',
    icon: <AttackIcon className="w-5 h-5" />,
    items: [
      {
        id: 'FIREBALL',
        name: 'Boule de feu',
        image: imgBouleFeu,
        kind: 'ACTION',
        description: 'Lance un projectile incandescent infligeant de lourds dégâts magiques.',
        cost: 15,
        cibles: 'Ennemis (Zone)',
        effect: '40 Dégâts Feu'
      },
      {
        id: 'SLASH',
        name: 'Attaque cinglante',
        image: imgAttaqueCinglante,
        kind: 'ACTION',
        description: 'Un coup de mêlée extrêmement rapide causant des saignements.',
        cost: 8,
        cibles: 'Ennemi',
        effect: '25 Dégâts + Saignement'
      }
    ]
  },
  {
    id: 'cat_defense',
    name: 'Défense',
    icon: <DefenseIcon className="w-5 h-5" />,
    items: [
      {
        id: 'BARRICADE',
        name: 'Barricade',
        image: imgBarricade,
        kind: 'ACTION',
        description: 'Dresse une protection physique absorbant les prochains coups.',
        cost: 10,
        cibles: 'Soi-même',
        effect: '+50 Armure'
      }
    ]
  },
  {
    id: 'cat_soin',
    name: 'Soin',
    icon: <HealIcon className="w-5 h-5" />,
    items: [
      {
        id: 'REINFORCE',
        name: 'Renforts',
        image: imgRenforts,
        kind: 'ACTION',
        description: "Rallie l'escouade et applique un soin tactique partagé.",
        cost: 20,
        cibles: 'Alliés',
        effect: '+15 Soin & +10 Défense'
      },
      {
        id: 'PALLIATIVE',
        name: 'Soins palliatifs',
        image: imgSoinsPalliatifs,
        kind: 'ACTION',
        description: "Traitement d'urgence pour stabiliser une cible gravement blessée.",
        cost: 12,
        cibles: 'Allié',
        effect: '+40 Soin (si PV bas)'
      }
    ]
  },
  {
    id: 'cat_move',
    name: 'Mouvement',
    icon: <MovementIcon className="w-5 h-5" />,
    items: [
      {
        id: 'FLEE',
        name: 'Fuite',
        image: imgFlee,
        kind: 'MOVEMENT',
        description: "S'éloigne au maximum de la cible sélectionnée par le Target Selector."
      },
      {
        id: 'CHARGE',
        name: 'Chargez !',
        image: imgCharge,
        kind: 'MOVEMENT',
        description: 'Se rue agressivement vers la cible en ligne droite.'
      },
      {
        id: 'TELEPORT',
        name: 'Téléportation',
        image: imgTeleport,
        kind: 'MOVEMENT',
        description: 'Se déplace instantanément sur une case stratégique proche de la cible.'
      }
    ]
  },
  {
    id: 'cat_boost',
    name: 'Boost',
    icon: <BoostIcon className="w-5 h-5" />,
    items: [
      {
        id: 'MAGE_BLESSING',
        name: 'Bénédiction du magicien',
        image: imgBenediction,
        kind: 'ACTION',
        description: 'Insuffle une énergie arcanique augmentant la puissance magique.',
        cost: 15,
        cibles: 'Allié',
        effect: '+30% Dégâts Magiques'
      },
      {
        id: 'EARTH_FORCE',
        name: 'Force de la terre',
        image: imgForceTerre,
        kind: 'ACTION',
        description: 'Ancre la cible au sol, la rendant insensible aux renversements.',
        cost: 10,
        cibles: 'Soi-même',
        effect: 'Immunité Contrôle'
      }
    ]
  }
];

export const CRITERIA_DATA_CONDITION_STEP = [
  { id: 'status', label: 'Status', options: ['POISON', 'PARALYSIE', 'BRULURE', 'GEL'] },
  { id: 'armor', label: 'Armor', options: ['ARMURE < 50%', 'ARMURE = 0'] },
  {
    id: 'health',
    label: 'Health',
    options: ['PV < 25%', 'PV < 50%', 'PV < 75%', 'PV < 100%', 'PV > 25%', 'PV > 50%']
  },
  {
    id: 'distance_enemy',
    label: "Distance d'un ennemi",
    options: ['FAIBLE DISTANCE', 'MOYENNE DISTANCE', 'LONGUE DISTANCE', 'HORS DE PORTEE']
  },
  {
    id: 'distance_character',
    label: "Distance d'un allié",
    options: ['FAIBLE DISTANCE', 'MOYENNE DISTANCE', 'LONGUE DISTANCE']
  },
  { id: 'buffs', label: 'Buffs', options: ['A UN BUFF', 'AUCUN BUFF'] }
];

export const FILTER_CATEGORIES = [
  { id: 'type', label: 'Type', options: ['TANK', 'SNIPER', 'MELEE', 'HEAL'] },
  { id: 'health', label: 'Santé', options: ['PV < 25%', 'PV < 50%', 'PV > 50%'] },
  { id: 'status', label: 'Statut', options: ['POISON', 'BRULURE'] }
];

export const SORT_CATEGORIES = [
  { id: 'distance_me', label: 'Distance de moi', options: ['LE PLUS PROCHE', 'LE PLUS ÉLOIGNÉ'] },
  { id: 'health_val', label: 'Santé', options: ['LES PLUS ÉLEVÉS', 'LES MOINS ÉLEVÉS'] },
  { id: 'damage_val', label: 'Dégâts', options: ['LES PLUS ÉLEVÉS', 'LES MOINS ÉLEVÉS'] }
];

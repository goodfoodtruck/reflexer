import type { ActionCategory, RealGambit } from "./GambitTypes";
import imgBouleFeu from "../../../assets/images/actions/attaque/Boule-feu.png";
import imgAttaqueCinglante from "../../../assets/images/actions/attaque/Attaque-Cinglant.png";
import imgBarricade from "../../../assets/images/actions/défense/Barricade.png";
import imgRenforts from "../../../assets/images/actions/soin/Renforts.png";
import imgSoinsPalliatifs from "../../../assets/images/actions/soin/Soins palliatifs.png";
import imgFlee from "../../../assets/images/actions/mouvement/Flee.png";
import imgCharge from "../../../assets/images/actions/mouvement/Charge.png";
import imgTeleport from "../../../assets/images/actions/mouvement/Teleport.png";
import imgBenediction from "../../../assets/images/actions/boost/Bénédiction-du-magicien.png";
import imgForceTerre from "../../../assets/images/actions/boost/Force-de-la-Terre.png";
import { AttackIcon } from "../icons/IconAttack";
import { DefenseIcon } from "../icons/IconDefense";
import { HealIcon } from "../icons/IconHeal";
import { MovementIcon } from "../icons/IconMovement";
import { BoostIcon } from "../icons/IconBoost";

export const INSPIRATIONS = [
  "Soin d'urgence", 
  "Sortie tactique", 
  "Coup de grâce", 
  "Riposte", 
  "Premier sang", 
  "Embuscade"
];

// TODO to delete when true data
export const INITIAL_GAMBITS: RealGambit[] = [
  {
    id: "flee-critical",
    priority: 1,
    conditions: {
      operator: "AND",
      conditions: [
        {
          type: "EXISTS",
          scope: {
            kind: "SELF",
            filter: { type: "HP_BELOW", threshold: 20 }
          }
        },
        {
          type: "EXISTS",
          scope: {
            kind: "ENEMY",
            filter: { type: "IN_RANGE", range: 3 }
          }
        }
      ]
    },
    targetSelector: {
      context: {
        kind: "ENEMY",
        filters: []
      },
      sort: "NEAREST"
    },
    intent: { kind: "MOVEMENT", strategy: "FLEE" }
  },
  {
    id: "self-heal",
    priority: 2,
    conditions: {
      operator: "AND",
      conditions: [
        {
          type: "EXISTS",
          scope: {
            kind: "SELF",
            filter: { type: "HP_BELOW", threshold: 50 }
          }
        },
        {
          operator: "NOT",
          condition: {
            type: "EXISTS",
            scope: {
              kind: "ENEMY",
              filter: { type: "IN_RANGE", range: 1 }
            }
          }
        }
      ]
    },
    targetSelector: {
      context: { kind: "SELF" },
      sort: "NEAREST"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "heal-potion",
        type: "heal",
        processorConfigs: []
      }
    }
  },
  {
    id: "heal-wounded-ally",
    priority: 3,
    conditions: {
      type: "EXISTS",
      scope: {
        kind: "ALLY",
        filter: { type: "HP_BELOW", threshold: 40 }
      }
    },
    targetSelector: {
      context: {
        kind: "ALLY",
        filters: [
          { type: "HP_BELOW", threshold: 40 },
          { type: "IN_RANGE", range: 4 }
        ]
      },
      sort: "LOWEST_HP"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "cure-light-wounds",
        type: "heal",
        processorConfigs: []
      }
    }
  },
  {
    id: "cure-ally-poison",
    priority: 4,
    conditions: {
      type: "EXISTS",
      scope: {
        kind: "ALLY",
        filter: { type: "HAS_STATUS", status: "POISON" }
      }
    },
    targetSelector: {
      context: {
        kind: "ALLY",
        filters: [
          { type: "HAS_STATUS", status: "POISON" },
          { type: "IN_RANGE", range: 3 }
        ]
      },
      sort: "LOWEST_HP"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "antidote",
        type: "status",
        processorConfigs: []
      }
    }
  },
  {
    id: "move-to-wounded-ally",
    priority: 5,
    conditions: {
      type: "EXISTS",
      scope: {
        kind: "ALLY",
        filter: { type: "HP_BELOW", threshold: 50 }
      }
    },
    targetSelector: {
      context: {
        kind: "ALLY",
        filters: [{ type: "HP_BELOW", threshold: 50 }]
      },
      sort: "LOWEST_HP"
    },
    intent: { kind: "MOVEMENT", strategy: "APPROACH" }
  },
  {
    id: "finish-weak-enemy",
    priority: 6,
    conditions: {
      type: "EXISTS",
      scope: {
        kind: "ENEMY",
        filter: { type: "HP_BELOW", threshold: 25 }
      }
    },
    targetSelector: {
      context: {
        kind: "ENEMY",
        filters: [
          { type: "HP_BELOW", threshold: 25 },
          { type: "IN_RANGE", range: 1 }
        ]
      },
      sort: "LOWEST_HP"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "execute",
        type: "attack",
        processorConfigs: []
      }
    }
  },
  {
    id: "defend-ally",
    priority: 7,
    conditions: {
      type: "EXISTS",
      scope: {
        kind : "ENEMY",
        filter: { "type": "IS_ATTACKING_ALLY" }
      }
    },
    targetSelector: {
      context: {
        kind: "ENEMY",
        filters: [
          { type: "IS_ATTACKING_ALLY" },
          { type: "IN_RANGE", range: 1 }
        ]
      },
      sort: "MOST_DANGEROUS"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "melee-strike",
        type: "attack",
        processorConfigs: []
      }
    }
  },
  {
    id: "ranged-snipe",
    priority: 8,
    conditions: {
      operator: "AND",
      conditions: [
        {
          type: "EXISTS",
          scope: {
            kind: "ENEMY",
            filter: { type: "IN_RANGE", range: 6 }
          }
        },
        {
          operator: "NOT",
          condition: {
            type: "EXISTS",
            scope: {
              kind: "ENEMY",
              filter: { type: "IN_RANGE", range: 2 }
            }
          }
        }
      ]
    },
    targetSelector: {
      context: {
        kind: "ENEMY",
        filters: [{ type: "IN_RANGE", range: 6 }]
      },
      sort: "MOST_DANGEROUS"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "longbow-shot",
        type: "attack",
        processorConfigs: []
      }
    }
  },
  {
    id: "kite-melee",
    priority: 9,
    conditions: {
      type: "EXISTS",
      scope: {
        kind: "ENEMY",
        filter: { type: "IN_RANGE", range: 2 }
      }
    },
    targetSelector: {
      context: {
        kind: "ENEMY",
        filters: [{ type: "IN_RANGE", range: 2 }]
      },
      sort: "NEAREST"
    },
    intent: { kind: "MOVEMENT", strategy: "FLEE" }
  },
  {
    id: "poison-tank",
    priority: 10,
    conditions: {
      operator: "AND",
      conditions: [
        {
          type: "EXISTS",
          scope: {
            kind: "ENEMY",
            filter: { type: "HP_ABOVE", threshold: 70 }
          }
        },
        {
          operator: "NOT",
          condition: {
            type: "EXISTS",
            scope: {
              kind: "ENEMY",
              filter: { type: "HAS_STATUS", status: "POISON" }
            }
          }
        }
      ]
    },
    targetSelector: {
      context: {
        kind: "ENEMY",
        filters: [
          { type: "HP_ABOVE", threshold: 70 },
          { type: "IN_RANGE", range: 4 }
        ]
      },
      sort: "HIGHEST_HP"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "venom-dart",
        type: "status",
        processorConfigs: []
      }
    }
  },
  {
    id: "trigger-trap",
    priority: 11,
    conditions: {
      operator: "AND",
      conditions: [
        {
          type: "EXISTS",
          scope: {
            kind: "TILE",
            filter: { type: "IS_TRAP" }
          }
        },
        {
          type: "EXISTS",
          scope: {
            kind: "ENEMY",
            filter: { type: "IN_RANGE", range: 5 }
          }
        }
      ]
    },
    targetSelector: {
      context: {
        kind: "TILE",
        filters: [
          { type: "IS_TRAP" },
          { type: "IN_RANGE", range: 5 }
        ]
      },
      sort: "NEAREST"
    },
    intent: {
      kind: "ACTION",
      action: {
        id: "detonate-trap",
        type: "attack",
        processorConfigs: []
      }
    }
  },
  {
    id: "advance-to-nearest",
    priority: 98,
    conditions: {
      type: "EXISTS",
      scope: {
        kind: "ENEMY",
        filter: { type: "IN_RANGE", range: 99 }
      }
    },
    targetSelector: {
      context: {
        kind: "ENEMY",
        filters: []
      },
      sort: "NEAREST"
    },
    intent: { kind: "MOVEMENT", strategy: "APPROACH" }
  },
  {
    id: "idle",
    priority: 99,
    conditions: {
      type: "EXISTS",
      scope: {
        kind: "SELF",
        filter: { type: "HP_ABOVE", threshold: 0 }
      }
    },
    targetSelector: {
      context: { kind: "SELF" },
      sort: "NEAREST"
    },
    intent: { kind: "MOVEMENT", strategy: "STAY" }
  }
];

export const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: "cat_attaque", name: "Attaque", icon: <AttackIcon className="w-5 h-5" />,
    items: [
      { id: "FIREBALL", name: "Boule de feu", image: imgBouleFeu, kind: "ACTION", description: "Lance un projectile incandescent infligeant de lourds dégâts magiques.", cost: 15, cibles: "Ennemis (Zone)", effect: "40 Dégâts Feu" },
      { id: "SLASH", name: "Attaque cinglante", image: imgAttaqueCinglante, kind: "ACTION", description: "Un coup de mêlée extrêmement rapide causant des saignements.", cost: 8, cibles: "Ennemi", effect: "25 Dégâts + Saignement" }
    ]
  },
  {
    id: "cat_defense", name: "Défense", icon: <DefenseIcon className="w-5 h-5" />,
    items: [
      { id: "BARRICADE", name: "Barricade", image: imgBarricade, kind: "ACTION", description: "Dresse une protection physique absorbant les prochains coups.", cost: 10, cibles: "Soi-même", effect: "+50 Armure" }
    ]
  },
  {
    id: "cat_soin", name: "Soin", icon: <HealIcon className="w-5 h-5" />,
    items: [
      { id: "REINFORCE", name: "Renforts", image: imgRenforts, kind: "ACTION", description: "Rallie l'escouade et applique un soin tactique partagé.", cost: 20, cibles: "Alliés", effect: "+15 Soin & +10 Défense" },
      { id: "PALLIATIVE", name: "Soins palliatifs", image: imgSoinsPalliatifs, kind: "ACTION", description: "Traitement d'urgence pour stabiliser une cible gravement blessée.", cost: 12, cibles: "Allié", effect: "+40 Soin (si PV bas)" }
    ]
  },
  {
    id: "cat_move", name: "Mouvement", icon: <MovementIcon className="w-5 h-5" />,
    items: [
      { id: "FLEE", name: "Fuite", image: imgFlee, kind: "MOVEMENT", description: "S'éloigne au maximum de la cible sélectionnée par le Target Selector." },
      { id: "CHARGE", name: "Chargez !", image: imgCharge, kind: "MOVEMENT", description: "Se rue agressivement vers la cible en ligne droite." },
      { id: "TELEPORT", name: "Téléportation", image: imgTeleport, kind: "MOVEMENT", description: "Se déplace instantanément sur une case stratégique proche de la cible." }
    ]
  },
  {
    id: "cat_boost", name: "Boost", icon: <BoostIcon className="w-5 h-5" />,
    items: [
      { id: "MAGE_BLESSING", name: "Bénédiction du magicien", image: imgBenediction, kind: "ACTION", description: "Insuffle une énergie arcanique augmentant la puissance magique.", cost: 15, cibles: "Allié", effect: "+30% Dégâts Magiques" },
      { id: "EARTH_FORCE", name: "Force de la terre", image: imgForceTerre, kind: "ACTION", description: "Ancre la cible au sol, la rendant insensible aux renversements.", cost: 10, cibles: "Soi-même", effect: "Immunité Contrôle" }
    ]
  }
];
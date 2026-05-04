import type { RealGambit } from "./GambitTypes";

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
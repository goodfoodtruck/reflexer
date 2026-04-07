import {
  Team,
  ActionType,
  SpellTargetType,
  StatusEffectType,
  type EntityDefinition,
} from '@domain/shared/types';

export const DEFAULT_PARTY: EntityDefinition[] = [
  {
    name: 'Knight',
    team: Team.Player,
    maxHp: 80,
    stats: { atk: 12, def: 10, spd: 6, range: 1 },
    spells: [
      {
        id: 'strike', name: 'Strike',
        category: 'attack',
        description: 'Frappe directe à l\'épée sur la cible adjacente.',
        cost: 3,
        effects: [{ label: '18 dégâts sur la cible' }],
        damage: 18, range: 1, cooldown: 0, targetType: SpellTargetType.Single,
      },
      {
        id: 'shield_bash', name: 'Shield Bash',
        category: 'defense',
        description: 'Percute l\'ennemi avec le bouclier, l\'étourdissant brièvement.',
        cost: 5,
        effects: [{ label: '10 dégâts' }, { label: 'Étourdi 1 tour' }],
        damage: 10, range: 1, cooldown: 3, targetType: SpellTargetType.Single,
        statusEffect: { type: StatusEffectType.Stun, duration: 1, value: 0 },
      },
    ],
    automations: [
      {
        id: 'knight_attack',
        name: 'Strike nearest enemy',
        priority: 1,
        conditions: [
          {
            id: 'allyLowHp',
            targetKind: 'ally',
            conditions: [
              {
                id: 'a_hp_lt_50',
                categoryId: 'health',
                value: { id: 'a_hp_lt_50', label: 'PV < 50%', conditionType: 'ALLY_HEALTH_BELOW', params: { threshold: 50 } }
              }
            ]
          }
        ],
        action: { type: ActionType.CastSpell, params: { spellId: 'strike' } },
        target: {
          blocks: [
            {
              id: 'tgt_k1',
              targetKind: 'enemy',
              filters: [
                {
                  id: 'tf_k1',
                  categoryId: 'priority',
                  value: { id: 'e_nearest', label: 'Le plus proche', filterType: 'NEAREST', params: {} },
                },
              ],
            },
          ],
        },
      },
    ],
    spawnPosition: { x: 1, y: 2 },
  },
  {
    name: 'Mage',
    team: Team.Player,
    maxHp: 45,
    stats: { atk: 16, def: 3, spd: 10, range: 4 },
    spells: [
      {
        id: 'heal', name: 'Heal',
        category: 'heal',
        description: 'Canalise de l\'énergie vitale vers un allié blessé.',
        cost: 6,
        effects: [{ label: '+20 PV sur la cible' }],
        damage: -20, range: 3, cooldown: 2, targetType: SpellTargetType.Single,
      },
      {
        id: 'smite', name: 'Smite',
        category: 'attack',
        description: 'Frappe divine concentrée sur un ennemi unique.',
        cost: 3,
        effects: [{ label: '10 dégâts sacrés' }],
        damage: 10, range: 3, cooldown: 0, targetType: SpellTargetType.Single,
      },
      {
        id: 'fireball', name: 'Fireball',
        category: 'attack',
        description: 'Boule de feu explosive qui brûle tous les ennemis proches.',
        cost: 8,
        effects: [{ label: '25 dégâts de feu en zone r=1' }],
        damage: 25, range: 4, cooldown: 2, targetType: SpellTargetType.Area, areaRadius: 1,
      },
      {
        id: 'arcane_bolt', name: 'Arcane Bolt',
        category: 'attack',
        description: 'Projectile arcanique rapide, idéal pour finir un ennemi affaibli.',
        cost: 2,
        effects: [{ label: '12 dégâts arcaniques' }],
        damage: 12, range: 4, cooldown: 0, targetType: SpellTargetType.Single,
      },
    ],
    automations: [
      {
        id: 'mage_heal',
        name: 'Heal weakest ally',
        priority: 0,
        conditions: [
          {
            id: 'allyLowHp',
            targetKind: 'ally',
            conditions: [
              {
                id: 'a_hp_lt_50',
                categoryId: 'health',
                value: { id: 'a_hp_lt_50', label: 'PV < 50%', conditionType: 'ALLY_HEALTH_BELOW', params: { threshold: 50 } }
              }
            ]
          }
        ],
        action: { type: ActionType.CastSpell, params: { spellId: 'heal' } },
        target: {
          blocks: [
            {
              id: 'tgt_m1',
              targetKind: 'ally',
              filters: [
                {
                  id: 'tf_m1',
                  categoryId: 'priority',
                  value: { id: 'a_weakest', label: 'Le plus faible', filterType: 'WEAKEST', params: {} },
                },
              ],
            },
          ],
        },
      },
      {
        id: 'mage_fireball',
        name: 'Fireball clustered enemies',
        priority: 1,
        conditions: [
          {
            id: 'enemyCluster',
            targetKind: 'enemy',
            conditions: [
              {
                id: 'e_count_gt_1',
                categoryId: 'count',
                value: { id: 'enemies_2plus', label: '≥2 enemies in range', conditionType: 'ENEMY_COUNT_AT_RANGE', params: { range: 1, min: 2 } }
              }
            ]
          }
        ],
        action: { type: ActionType.CastSpell, params: { spellId: 'fireball' } },
        target: {
          blocks: [
            {
              id: 'tgt_m2',
              targetKind: 'enemy',
              filters: [
                {
                  id: 'tf_m2',
                  categoryId: 'priority',
                  value: { id: 'e_nearest', label: 'Le plus proche', filterType: 'NEAREST', params: {} },
                },
                {
                  id: 'tf_m3',
                  categoryId: 'count',
                  value: { id: 'e_cnt_2', label: '≥ 2 ennemis visibles', filterType: 'ENEMY_COUNT_GTE', params: { min: 2 } },
                },
              ],
            },
          ],
        },
      }
    ],
    spawnPosition: { x: 0, y: 3 },
  },
];

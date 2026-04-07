import type {
  EntityDefinition,
  GridConfig,
  GridPosition,
  EncounterData,
} from '@domain/shared/types';
import {
  Team,
  ActionType,
  TargetType,
  SpellTargetType,
} from '@domain/shared/types';
import { createBattleEntity, type BattleEntity } from '@domain/battle/components';

// ─── Helper pour construire un bloc condition ─────────────────

function cBlock(
  conditionType: string,
  params: Record<string, number>,
  label: string,
  targetKind: 'enemy' | 'ally' | 'self' | 'other' = 'other',
): { id: string; targetKind: string; conditions: { id: string; categoryId: string; value: { id: string; label: string; conditionType: string; params: Record<string, number> } }[] }[] {
  return [{
    id: `cb_${Math.random().toString(36).slice(2, 6)}`,
    targetKind,
    conditions: [{
      id: `ac_${Math.random().toString(36).slice(2, 6)}`,
      categoryId: 'auto',
      value: { id: `v_${conditionType}`, label, conditionType, params },
    }],
  }];
}

// ─── Templates d'ennemis ───────────────────────────────────────

const ENEMY_TEMPLATES: Record<string, Omit<EntityDefinition, 'team' | 'spawnPosition'>> = {
  goblin: {
    name: 'Goblin',
    maxHp: 30,
    stats: { atk: 8, def: 3, spd: 12, range: 1 },
    spells: [
      {
        id: 'slash',
        name: 'Slash',
        damage: 12,
        range: 1,
        cooldown: 0,
        targetType: SpellTargetType.Single,
      },
    ],
    automations: [
      {
        id: 'auto_goblin_attack',
        name: 'Attack nearest',
        priority: 1,
        conditions: cBlock('ENEMY_IN_RANGE', { range: 1 }, 'Ennemi à portée 1', 'enemy'),
        action: { type: ActionType.CastSpell, params: { spellId: 'slash' } },
        target: { type: TargetType.NearestEnemy },
      },
      {
        id: 'auto_goblin_move',
        name: 'Move to enemy',
        priority: 2,
        conditions: cBlock('ALWAYS', {}, 'Toujours', 'other'),
        action: { type: ActionType.Move, params: {} },
        target: { type: TargetType.NearestEnemy },
      },
    ],
  },
  skeleton_archer: {
    name: 'Skeleton Archer',
    maxHp: 20,
    stats: { atk: 10, def: 2, spd: 8, range: 4 },
    spells: [
      {
        id: 'arrow',
        name: 'Arrow Shot',
        damage: 15,
        range: 4,
        cooldown: 0,
        targetType: SpellTargetType.Single,
      },
    ],
    automations: [
      {
        id: 'auto_archer_shoot',
        name: 'Shoot weakest',
        priority: 1,
        conditions: cBlock('ENEMY_IN_RANGE', { range: 4 }, 'Ennemi à portée 4', 'enemy'),
        action: { type: ActionType.CastSpell, params: { spellId: 'arrow' } },
        target: { type: TargetType.WeakestEnemy },
      },
      {
        id: 'auto_archer_flee',
        name: 'Flee if close',
        priority: 0,
        conditions: cBlock('ENEMY_IN_RANGE', { range: 1 }, 'Ennemi à portée 1', 'enemy'),
        action: { type: ActionType.Flee, params: {} },
        target: { type: TargetType.NearestEnemy },
      },
    ],
  },
  orc_brute: {
    name: 'Orc Brute',
    maxHp: 60,
    stats: { atk: 14, def: 8, spd: 5, range: 1 },
    spells: [
      {
        id: 'smash',
        name: 'Smash',
        damage: 20,
        range: 1,
        cooldown: 2,
        targetType: SpellTargetType.Single,
      },
      {
        id: 'punch',
        name: 'Punch',
        damage: 10,
        range: 1,
        cooldown: 0,
        targetType: SpellTargetType.Single,
      },
    ],
    automations: [
      {
        id: 'auto_orc_smash',
        name: 'Smash nearest',
        priority: 0,
        conditions: cBlock('ENEMY_IN_RANGE', { range: 1 }, 'Ennemi à portée 1', 'enemy'),
        action: { type: ActionType.CastSpell, params: { spellId: 'smash' } },
        target: { type: TargetType.NearestEnemy },
      },
      {
        id: 'auto_orc_punch',
        name: 'Punch nearest',
        priority: 1,
        conditions: cBlock('ENEMY_IN_RANGE', { range: 1 }, 'Ennemi à portée 1', 'enemy'),
        action: { type: ActionType.CastSpell, params: { spellId: 'punch' } },
        target: { type: TargetType.NearestEnemy },
      },
      {
        id: 'auto_orc_move',
        name: 'Charge',
        priority: 2,
        conditions: cBlock('ALWAYS', {}, 'Toujours', 'other'),
        action: { type: ActionType.Move, params: {} },
        target: { type: TargetType.NearestEnemy },
      },
    ],
  },
};

// ─── Configuration selon le type de noeud ──────────────────────

interface EncounterConfig {
  gridSize: [number, number];
  enemyCountRange: [number, number];
  possibleEnemies: string[];
  obstacleCount: number;
}

const ENCOUNTER_CONFIGS: Record<string, EncounterConfig> = {
  COMBAT: {
    gridSize: [8, 6],
    enemyCountRange: [2, 3],
    possibleEnemies: ['goblin', 'skeleton_archer'],
    obstacleCount: 3,
  },
  ELITE: {
    gridSize: [10, 8],
    enemyCountRange: [3, 5],
    possibleEnemies: ['goblin', 'skeleton_archer', 'orc_brute'],
    obstacleCount: 5,
  },
  BOSS: {
    gridSize: [12, 10],
    enemyCountRange: [1, 2],
    possibleEnemies: ['orc_brute'],
    obstacleCount: 4,
  },
};

// ─── Générateur ────────────────────────────────────────────────

export class EncounterGenerator {
  /**
   * Génère les données d'un encounter (ennemis + grille)
   * pour un type de noeud donné.
   */
  generateEncounter(nodeType: string): EncounterData {
    const config = ENCOUNTER_CONFIGS[nodeType] ?? ENCOUNTER_CONFIGS['COMBAT'];
    const [gw, gh] = config.gridSize;

    // Obstacles aléatoires
    const obstacles: GridPosition[] = [];
    for (let i = 0; i < config.obstacleCount; i++) {
      let pos: GridPosition;
      do {
        pos = { x: this.randInt(1, gw - 2), y: this.randInt(1, gh - 2) };
      } while (obstacles.some((o) => o.x === pos.x && o.y === pos.y));
      obstacles.push(pos);
    }

    const gridConfig: GridConfig = { width: gw, height: gh, obstacles };

    // Ennemis
    const [minE, maxE] = config.enemyCountRange;
    const count = this.randInt(minE, maxE);
    const enemies: EntityDefinition[] = [];

    for (let i = 0; i < count; i++) {
      const templateKey =
        config.possibleEnemies[
          this.randInt(0, config.possibleEnemies.length - 1)
        ];
      const template = ENEMY_TEMPLATES[templateKey];
      if (!template) continue;

      // Spawn côté droit de la grille
      let spawnPos: GridPosition;
      do {
        spawnPos = {
          x: this.randInt(Math.floor(gw / 2), gw - 1),
          y: this.randInt(0, gh - 1),
        };
      } while (
        obstacles.some((o) => o.x === spawnPos.x && o.y === spawnPos.y) ||
        enemies.some(
          (e) =>
            e.spawnPosition?.x === spawnPos.x &&
            e.spawnPosition?.y === spawnPos.y,
        )
      );

      enemies.push({
        ...template,
        team: Team.Enemy,
        spawnPosition: spawnPos,
      });
    }

    return { enemies, gridConfig };
  }

  /**
   * Crée les BattleEntity à partir des définitions joueur + ennemis.
   */
  spawnEntities(
    playerDefs: EntityDefinition[],
    encounter: EncounterData,
  ): BattleEntity[] {
    const entities: BattleEntity[] = [];
    let idCounter = 0;

    // Joueurs (spawn côté gauche)
    for (const def of playerDefs) {
      const pos = def.spawnPosition ?? { x: 0, y: idCounter };
      entities.push(
        createBattleEntity(
          `player_${idCounter}`,
          def.name,
          Team.Player,
          def.maxHp,
          def.stats,
          def.spells,
          def.automations,
          pos,
        ),
      );
      idCounter++;
    }

    // Ennemis
    let enemyCounter = 0;
    for (const def of encounter.enemies) {
      const pos = def.spawnPosition ?? {
        x: encounter.gridConfig.width - 1,
        y: enemyCounter,
      };
      entities.push(
        createBattleEntity(
          `enemy_${enemyCounter}`,
          def.name,
          Team.Enemy,
          def.maxHp,
          def.stats,
          def.spells,
          def.automations,
          pos,
        ),
      );
      enemyCounter++;
    }

    return entities;
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

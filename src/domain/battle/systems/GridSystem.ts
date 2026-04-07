import type {
  GridConfig,
  GridPosition,
  EntityId,
  SpellDefinition,
  SpellTargetType,
} from '@domain/shared/types';
import type { BattleState } from '@domain/battle/BattleState';

interface AStarNode {
  pos: GridPosition;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

export class GridSystem {
  constructor(private config: GridConfig) {}

  // ─── Pathfinding A* ────────────────────────────────────────
  findPath(
    from: GridPosition,
    to: GridPosition,
    state: BattleState,
  ): GridPosition[] {
    if (!this.isInBounds(to) || this.isBlocked(to, state)) return [];

    const openSet: AStarNode[] = [];
    const closedSet = new Set<string>();

    const start: AStarNode = {
      pos: from,
      g: 0,
      h: this.manhattanDistance(from, to),
      f: this.manhattanDistance(from, to),
      parent: null,
    };
    openSet.push(start);

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const key = `${current.pos.x},${current.pos.y}`;

      if (current.pos.x === to.x && current.pos.y === to.y) {
        return this.reconstructPath(current);
      }

      closedSet.add(key);

      for (const neighbor of this.getNeighbors(current.pos)) {
        const nKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(nKey)) continue;
        if (this.isBlocked(neighbor, state)) continue;

        const g = current.g + 1;
        const h = this.manhattanDistance(neighbor, to);
        const existing = openSet.find(
          (n) => n.pos.x === neighbor.x && n.pos.y === neighbor.y,
        );

        if (!existing || g < existing.g) {
          const node: AStarNode = { pos: neighbor, g, h, f: g + h, parent: current };
          if (existing) {
            Object.assign(existing, node);
          } else {
            openSet.push(node);
          }
        }
      }
    }

    return []; // pas de chemin
  }

  private reconstructPath(node: AStarNode): GridPosition[] {
    const path: GridPosition[] = [];
    let current: AStarNode | null = node;
    while (current) {
      path.unshift(current.pos);
      current = current.parent;
    }
    return path;
  }

  // ─── Utilitaires grille ────────────────────────────────────
  manhattanDistance(a: GridPosition, b: GridPosition): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  isInBounds(pos: GridPosition): boolean {
    return (
      pos.x >= 0 &&
      pos.y >= 0 &&
      pos.x < this.config.width &&
      pos.y < this.config.height
    );
  }

  isBlocked(pos: GridPosition, state: BattleState): boolean {
    // Obstacles statiques
    if (this.config.obstacles.some((o) => o.x === pos.x && o.y === pos.y)) {
      return true;
    }
    // Entités vivantes bloquent la case
    for (const entity of state.entities.values()) {
      if (
        entity.isAlive &&
        entity.position.x === pos.x &&
        entity.position.y === pos.y
      ) {
        return true;
      }
    }
    return false;
  }

  getNeighbors(pos: GridPosition): GridPosition[] {
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    return dirs
      .map((d) => ({ x: pos.x + d.x, y: pos.y + d.y }))
      .filter((p) => this.isInBounds(p));
  }

  // ─── Résolution cibles de sorts ────────────────────────────
  resolveSpellTargets(
    spell: SpellDefinition,
    targetPos: GridPosition,
    state: BattleState,
  ): EntityId[] {
    const targets: EntityId[] = [];

    for (const entity of state.entities.values()) {
      if (!entity.isAlive) continue;

      switch (spell.targetType) {
        case 'SINGLE' as SpellTargetType:
          if (
            entity.position.x === targetPos.x &&
            entity.position.y === targetPos.y
          ) {
            targets.push(entity.id);
          }
          break;
        case 'AREA' as SpellTargetType: {
          const dist = this.manhattanDistance(entity.position, targetPos);
          if (dist <= (spell.areaRadius ?? 1)) {
            targets.push(entity.id);
          }
          break;
        }
        case 'LINE' as SpellTargetType:
          // Simplifié : même ligne ou colonne
          if (
            entity.position.x === targetPos.x ||
            entity.position.y === targetPos.y
          ) {
            const dist = this.manhattanDistance(entity.position, targetPos);
            if (dist <= spell.range) {
              targets.push(entity.id);
            }
          }
          break;
        case 'SELF' as SpellTargetType:
          // Géré ailleurs, la cible est le caster
          break;
      }
    }

    return targets;
  }

  // ─── Trouver la case libre la plus proche ──────────────────
  findNearestFreeCell(
    from: GridPosition,
    toward: GridPosition,
    state: BattleState,
  ): GridPosition | null {
    // BFS depuis toward vers from pour trouver une case libre adjacente
    const visited = new Set<string>();
    const queue: GridPosition[] = [toward];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (!this.isBlocked(current, state)) return current;

      for (const neighbor of this.getNeighbors(current)) {
        queue.push(neighbor);
      }
    }

    return null;
  }
}

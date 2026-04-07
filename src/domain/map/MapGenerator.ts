import {
  NodeType,
  type MapData,
  type MapNodeData,
  type NodeId,
} from '@domain/shared/types';

export interface MapGeneratorConfig {
  totalDepth: number;       // nombre de rangées (typiquement 12-15)
  nodesPerRow: [number, number]; // [min, max] noeuds par rangée
  pathDensity: number;      // 0-1, chance de connexions supplémentaires
  eliteChance: number;      // chance qu'un noeud soit Elite (0-1)
  restFrequency: number;    // tous les X niveaux, 1 noeud Rest possible
  eventChance: number;      // chance qu'un noeud soit Event
  shopFrequency: number;    // tous les X niveaux, 1 noeud Shop possible
}

const DEFAULT_CONFIG: MapGeneratorConfig = {
  totalDepth: 12,
  nodesPerRow: [2, 4],
  pathDensity: 0.3,
  eliteChance: 0.15,
  restFrequency: 4,
  eventChance: 0.1,
  shopFrequency: 5,
};

export class MapGenerator {
  private config: MapGeneratorConfig;

  constructor(config: Partial<MapGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generate(): MapData {
    const nodes = new Map<NodeId, MapNodeData>();
    const rows: NodeId[][] = [];

    // ─── Générer les rangées ───────────────────────────────
    for (let depth = 0; depth < this.config.totalDepth; depth++) {
      const [min, max] = this.config.nodesPerRow;
      const count = this.randInt(min, max);
      const row: NodeId[] = [];

      for (let col = 0; col < count; col++) {
        const id = `node_${depth}_${col}`;
        const type = this.resolveNodeType(depth);

        const node: MapNodeData = {
          id,
          type,
          depth,
          column: col,
          children: [],
          completed: false,
        };
        nodes.set(id, node);
        row.push(id);
      }
      rows.push(row);
    }

    // ─── Boss final ────────────────────────────────────────
    const bossId = 'node_boss';
    const bossNode: MapNodeData = {
      id: bossId,
      type: NodeType.Boss,
      depth: this.config.totalDepth,
      column: 0,
      children: [],
      completed: false,
    };
    nodes.set(bossId, bossNode);

    // ─── Connecter les rangées ─────────────────────────────
    for (let depth = 0; depth < rows.length - 1; depth++) {
      const currentRow = rows[depth];
      const nextRow = rows[depth + 1];

      // Chaque noeud doit avoir au moins 1 enfant
      for (const nodeId of currentRow) {
        const node = nodes.get(nodeId)!;
        // Connexion principale : vers le noeud le plus proche en colonne
        const bestChild = this.closestInRow(node.column, nextRow, nodes);
        if (bestChild && !node.children.includes(bestChild)) {
          node.children.push(bestChild);
        }

        // Connexions supplémentaires selon pathDensity
        for (const candidateId of nextRow) {
          if (node.children.includes(candidateId)) continue;
          if (Math.random() < this.config.pathDensity) {
            node.children.push(candidateId);
          }
        }
      }

      // S'assurer que chaque noeud de la rangée suivante a au moins 1 parent
      for (const childId of nextRow) {
        const hasParent = currentRow.some((parentId) =>
          nodes.get(parentId)!.children.includes(childId),
        );
        if (!hasParent) {
          // Connecter le parent le plus proche
          const child = nodes.get(childId)!;
          const bestParent = this.closestInRow(child.column, currentRow, nodes);
          if (bestParent) {
            nodes.get(bestParent)!.children.push(childId);
          }
        }
      }
    }

    // Dernière rangée → Boss
    const lastRow = rows[rows.length - 1];
    for (const nodeId of lastRow) {
      nodes.get(nodeId)!.children.push(bossId);
    }

    return {
      nodes,
      startNodeIds: rows[0],
      bossNodeId: bossId,
      currentNodeId: null,
    };
  }

  // ─── Résolution du type de noeud ─────────────────────────

  private resolveNodeType(depth: number): NodeType {
    // Première rangée = toujours Combat
    if (depth === 0) return NodeType.Combat;

    // Rest tous les restFrequency niveaux
    if (depth > 0 && depth % this.config.restFrequency === 0) {
      if (Math.random() < 0.6) return NodeType.Rest;
    }

    // Shop tous les shopFrequency niveaux
    if (depth > 0 && depth % this.config.shopFrequency === 0) {
      if (Math.random() < 0.5) return NodeType.Shop;
    }

    // Event
    if (Math.random() < this.config.eventChance) return NodeType.Event;

    // Elite (pas trop tôt)
    if (depth >= 3 && Math.random() < this.config.eliteChance) {
      return NodeType.EliteCombat;
    }

    return NodeType.Combat;
  }

  // ─── Helpers ─────────────────────────────────────────────

  private closestInRow(
    column: number,
    row: NodeId[],
    nodes: Map<NodeId, MapNodeData>,
  ): NodeId | null {
    if (row.length === 0) return null;
    let best = row[0];
    let bestDist = Math.abs(nodes.get(best)!.column - column);
    for (const id of row) {
      const dist = Math.abs(nodes.get(id)!.column - column);
      if (dist < bestDist) {
        bestDist = dist;
        best = id;
      }
    }
    return best;
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

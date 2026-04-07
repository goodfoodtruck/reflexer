import Phaser from 'phaser';
import { eventBus } from '@infra/bridge/EventBus';
import { gameStore, GameEvents } from '@infra/bridge/GameStore';
import { NodeType, type MapNodeData, type MapData } from '@domain/shared/types';

const NODE_RADIUS = 18;
const ROW_HEIGHT = 80;
const COL_WIDTH = 100;
const OFFSET_X = 120;
const OFFSET_Y = 60;

const NODE_COLORS: Record<string, number> = {
  [NodeType.Combat]: 0x64748b,
  [NodeType.EliteCombat]: 0xf59e0b,
  [NodeType.Boss]: 0xef4444,
  [NodeType.Rest]: 0x22c55e,
  [NodeType.Event]: 0x8b5cf6,
  [NodeType.Shop]: 0x06b6d4,
};

const NODE_ICONS: Record<string, string> = {
  [NodeType.Combat]: '⚔',
  [NodeType.EliteCombat]: '💀',
  [NodeType.Boss]: '👹',
  [NodeType.Rest]: '🔥',
  [NodeType.Event]: '❓',
  [NodeType.Shop]: '🛒',
};

export class MapScene extends Phaser.Scene {
  private nodeObjects = new Map<string, Phaser.GameObjects.Container>();
  private unsubscribers: (() => void)[] = [];

  constructor() {
    super({ key: 'MapScene' });
  }

  create(): void {
    this.drawMap();

    this.unsubscribers.push(
      eventBus.on(GameEvents.SCREEN_CHANGE, (screen: string) => {
        // Guard : ne rien faire si la scène n'est plus active
        if (!this.scene.isActive()) return;
        if (screen === 'map') {
          this.drawMap();
        }
      }),
    );
  }

  shutdown(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    this.nodeObjects.clear();
  }

  private drawMap(): void {
    // Guard supplémentaire
    if (!this.sys || !this.sys.displayList) return;

    // Clear
    this.children.removeAll(true);
    this.nodeObjects.clear();

    const mapData = gameStore.mapData;
    if (!mapData) return;

    const g = this.add.graphics();

    // D'abord les connections (lignes)
    for (const node of mapData.nodes.values()) {
      const fromX = OFFSET_X + node.column * COL_WIDTH;
      const fromY = OFFSET_Y + node.depth * ROW_HEIGHT;

      for (const childId of node.children) {
        const child = mapData.nodes.get(childId);
        if (!child) continue;
        const toX = OFFSET_X + child.column * COL_WIDTH;
        const toY = OFFSET_Y + child.depth * ROW_HEIGHT;

        g.lineStyle(2, 0x334155, 0.5);
        g.lineBetween(fromX, fromY, toX, toY);
      }
    }

    // Ensuite les noeuds
    for (const node of mapData.nodes.values()) {
      this.createNodeSprite(node, mapData);
    }
  }

  private createNodeSprite(node: MapNodeData, mapData: MapData): void {
    const x = OFFSET_X + node.column * COL_WIDTH;
    const y = OFFSET_Y + node.depth * ROW_HEIGHT;

    const container = this.add.container(x, y);

    // Accessible ?
    const isAccessible = this.isNodeAccessible(node.id, mapData);
    const alpha = node.completed ? 0.4 : isAccessible ? 1 : 0.3;

    // Cercle
    const circle = this.add.graphics();
    const color = NODE_COLORS[node.type] ?? 0x64748b;
    circle.fillStyle(color, alpha);
    circle.fillCircle(0, 0, NODE_RADIUS);
    if (isAccessible && !node.completed) {
      circle.lineStyle(2, 0xfbbf24, 1);
      circle.strokeCircle(0, 0, NODE_RADIUS + 2);
    }
    container.add(circle);

    // Icône
    const icon = this.add
      .text(0, 0, NODE_ICONS[node.type] ?? '⚔', {
        fontSize: '16px',
      })
      .setOrigin(0.5);
    container.add(icon);

    // Interactivité
    if (isAccessible && !node.completed) {
      container.setInteractive(
        new Phaser.Geom.Circle(0, 0, NODE_RADIUS + 4),
        Phaser.Geom.Circle.Contains,
      );
      container.on('pointerdown', () => {
        gameStore.selectMapNode(node.id);
      });
      container.on('pointerover', () => {
        container.setScale(1.15);
      });
      container.on('pointerout', () => {
        container.setScale(1);
      });
    }

    this.nodeObjects.set(node.id, container);
  }

  private isNodeAccessible(nodeId: string, mapData: MapData): boolean {
    // Si aucun noeud n'est encore visité, les starts sont accessibles
    if (!mapData.currentNodeId) {
      return mapData.startNodeIds.includes(nodeId);
    }

    // Sinon, accessible si un noeud complété a ce noeud comme enfant
    for (const node of mapData.nodes.values()) {
      if (node.completed && node.children.includes(nodeId)) return true;
    }

    return false;
  }
}

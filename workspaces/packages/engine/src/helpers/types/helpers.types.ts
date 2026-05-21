export type Position = { x: number, y: number }
export type Dimensions = { width: number, height: number }

export interface DijkstraNode {
  position: Position;
  parent: DijkstraNode | null;
  distance: number;
}
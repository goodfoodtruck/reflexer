import { DijkstraNode, Position } from '@helpers/types/helpers.types';

export function isAdjacent(from: Position, to: Position): boolean {
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  return dx + dy === 1;
}

export function getAdjacentPositions(currentPos: Position): Position[] {
  return [
    { x: currentPos.x, y: currentPos.y - 1 }, // Haut
    { x: currentPos.x, y: currentPos.y + 1 }, // Bas
    { x: currentPos.x - 1, y: currentPos.y }, // Gauche
    { x: currentPos.x + 1, y: currentPos.y } // Droite
  ];
}

export function toPosKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function isSamePosition(posA: Position, posB: Position): boolean {
  return posA.x === posB.x && posA.y === posB.y;
}

export function runDijkstra(
  startPos: Position,
  targetPos: Position,
  obstacles: Position[]
): Position[] {

  const openList: DijkstraNode[] = [{ position: startPos, parent: null, distance: 0 }];
  const distances = new Map<string, number>([[toPosKey(startPos), 0]]);
  const obstacleKeys = new Set(obstacles.map(toPosKey));

  let finalNode: DijkstraNode | null = null;
  
  while (openList.length > 0) {
    openList.sort((a, b) => a.distance - b.distance);
    const current = openList.shift()!;

    if (isSamePosition(current.position, targetPos)) {
      finalNode = current;
      break;
    }

    const neighbors = getAdjacentPositions(current.position);

    const validNeighbors = neighbors.filter((neighbor) => {
      const neighborKey = toPosKey(neighbor);
      return isSamePosition(neighbor, targetPos) || !obstacleKeys.has(neighborKey);
    });

    for (const neighbor of validNeighbors) {
      const newDistance = current.distance + 1;
      const neighborKey = toPosKey(neighbor);

      if (!distances.has(neighborKey) || newDistance < distances.get(neighborKey)!) {
        distances.set(neighborKey, newDistance);
        openList.push({ position: neighbor, parent: current, distance: newDistance });
      }
    }
  }

  return reconstructPath(finalNode);
}

export function reconstructPath(endNode: DijkstraNode | null): Position[] {
  if (!endNode) return [];

  const path: Position[] = [];
  let current = endNode;

  while (current.parent) {
    path.unshift(current.position);
    current = current.parent;
  }

  return path;
}

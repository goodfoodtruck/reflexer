import { Position } from '@helpers/types/helpers.types';

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



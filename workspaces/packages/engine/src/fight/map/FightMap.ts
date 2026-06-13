import {DijkstraNode, Dimensions, Position} from "@helpers/types/helpers.types"
import { MapCell, FightMapConfig, EObstacleType } from "@fight/map/fight.map.types"
import { PathfindingParams } from "@fight/fight.types";
import { getAdjacentPositions, isSamePosition, manhattanDistance, toPosKey } from "@helpers/map/utils";
import { bresenhamLine } from "@helpers/map/lineOfSight";

export class FightMap {
    public readonly id: string;
    private readonly cells: MapCell[][]
    private readonly dimensions: Dimensions

    constructor(config: FightMapConfig) {
        this.id = config.id;
        this.dimensions = config.dimensions
        this.cells = config.cells.map((row, y) =>
            row.map((cell, x) => ({ type: cell, position: { x, y } }))
        )
    }

    isWalkable(position: Position): boolean {
        const cell = this.cells[position.y]?.[position.x];
        return cell?.type === EObstacleType.FLOOR
    }

    getDimensions(): Dimensions {
        return this.dimensions;
    }

    hasLineOfSight(from: Position, to: Position): boolean {
        const line = bresenhamLine(from, to)
        const intermediateCells = line.slice(1, -1)
        return intermediateCells.every(cell => this.isWalkable(cell))
    }

    pathFinding({ context, fightContext }: PathfindingParams): Position[] {
        const startPos  = fightContext.getAliveEntityOrThrow(context.casterId).position;
        const targetPos = context.targetPosition;
        const obstacles = fightContext.getObstacles(); 
    
        const filteredObstacles = obstacles.filter(pos => !isSamePosition(pos, targetPos));
    
        return this.runDijkstra(startPos, targetPos, filteredObstacles);
    }

    findFleePath({ context, fightContext }: PathfindingParams): Position[] {
        const startPos = fightContext.getAliveEntityOrThrow(context.casterId).position;
        const threatPos = context.targetPosition;
        const obstacles = fightContext.getObstacles();

        const obstacleKeys = new Set(obstacles.map(toPosKey));
        obstacleKeys.delete(toPosKey(startPos)); // sa propre case n'est pas un obstacle

        const startNode: DijkstraNode = { position: startPos, parent: null, distance: 0 };
        const queue: DijkstraNode[] = [startNode];
        const visited = new Set<string>([toPosKey(startPos)]);

        let best = startNode;
        let bestThreatDistance = manhattanDistance(startPos, threatPos);

        while (queue.length > 0) {
            const current = queue.shift()!;

            const threatDistance = manhattanDistance(current.position, threatPos);
            if (threatDistance > bestThreatDistance) {
                best = current;
                bestThreatDistance = threatDistance;
            }

            for (const neighbor of getAdjacentPositions(current.position)) {
                const neighborKey = toPosKey(neighbor);
                if (visited.has(neighborKey) || obstacleKeys.has(neighborKey) || !this.isWalkable(neighbor)) continue;

                visited.add(neighborKey);
                queue.push({ position: neighbor, parent: current, distance: current.distance + 1 });
            }
        }

        return this.reconstructPath(best);
    }

    private runDijkstra(
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

        return this.reconstructPath(finalNode);
    }

    reconstructPath(endNode: DijkstraNode | null): Position[] {
        if (!endNode) return [];

        const path: Position[] = [];
        let current = endNode;

        while (current.parent) {
            path.unshift(current.position);
            current = current.parent;
        }

        return path;
    }
}
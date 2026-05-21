import { PathfindingParams } from '@fight/fight.types';
import { Position } from '@helpers/types/helpers.types';
import { isSamePosition, runDijkstra } from '@helpers/map/utils';

export class FightService {
  constructor() {}

  pathFinding({ context, fightContext }: PathfindingParams): Position[] {
    const startPos  = fightContext.getAliveEntityOrThrow(context.casterId).position;
    const targetPos = fightContext.getAliveEntityOrThrow(context.targetId).position;
    const obstacles = fightContext.getObstacles(); 

    const filteredObstacles = obstacles.filter(pos => !isSamePosition(pos, targetPos));

    return runDijkstra(startPos, targetPos, filteredObstacles);
  }
}
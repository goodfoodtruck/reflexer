import { describe, it, expect } from 'vitest';
import { PathfindingParams } from '@fight/fight.types';
import { FightService } from '@fight/services/fight.service';

describe('FightService', () => {
  const fightService = new FightService();

  it('devrait calculer le vrai chemin en contournant les obstacles et en atteignant la cible', () => {
    const casterPos = { x: 0, y: 0 };
    const targetPos = { x: 2, y: 0 };
    
    // On bloque le chemin direct (1,0) ET le passage par le haut (-1) 
    // pour forcer le chemin par le bas (y = 1)
    const mockObstacles = [
      { x: 1, y: 0 },  // Le mur direct
      { x: 0, y: -1 }, // Plafond bloqué
      { x: 1, y: -1 }, // Plafond bloqué
      { x: 2, y: -1 }, // Plafond bloqué
      { x: 2, y: 0 }   // La cible
    ];

    const mockFightContext = {
      getAliveEntityOrThrow: (id: string) => {
        if (id === 'caster') return { position: casterPos };
        if (id === 'target') return { position: targetPos };
        throw new Error('Entity not found');
      },
      getObstacles: () => mockObstacles,
    } as any;

    const params: PathfindingParams = {
      context: { casterId: 'caster', targetId: 'target' },
      fightContext: mockFightContext,
    } as any;

    const result = fightService.pathFinding(params);

    expect(result).not.toContainEqual({ x: 1, y: 0 }); 
    expect(result).not.toContainEqual({ x: 1, y: -1 }); 
    expect(result[result.length - 1]).toEqual(targetPos); 
    expect(result).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 0 }
    ]);
  });

  it('devrait retourner un tableau vide si la cible est totalement inaccessible', () => {
    const casterPos = { x: 0, y: 0 };
    const targetPos = { x: 2, y: 0 };
    
    const mockObstacles = [
      { x: 1, y: 0 },  // Droite
      { x: -1, y: 0 }, // Gauche
      { x: 0, y: 1 },  // Bas
      { x: 0, y: -1 }, // Haut
      { x: 2, y: 0 }   // La cible
    ];

    const mockFightContext = {
      getAliveEntityOrThrow: (id: string) => {
        if (id === 'caster') return { position: casterPos };
        if (id === 'target') return { position: targetPos };
        throw new Error('Entity not found');
      },
      getObstacles: () => mockObstacles,
    } as any;

    const params: PathfindingParams = {
      context: { casterId: 'caster', targetId: 'target' },
      fightContext: mockFightContext,
    } as any;

    const result = fightService.pathFinding(params);

    expect(result).toEqual([]);
  });

  it('devrait retourner un tableau vide si le caster et la cible sont déjà sur la même position', () => {
    const identicalPos = { x: 4, y: 4 };

    const mockFightContext = {
      getAliveEntityOrThrow: () => ({ position: identicalPos }),
      getObstacles: () => [identicalPos],
    } as any;

    const params: PathfindingParams = {
      context: { casterId: 'caster', targetId: 'target' },
      fightContext: mockFightContext,
    } as any;

    const result = fightService.pathFinding(params);

    expect(result).toEqual([]);
  });
});
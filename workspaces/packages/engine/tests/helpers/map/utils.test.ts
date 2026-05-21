import { describe, it, expect } from 'vitest';
import { 
  isAdjacent, 
  getAdjacentPositions, 
  toPosKey, 
  isSamePosition, 
  runDijkstra, 
  reconstructPath 
} from '@helpers/map/utils';
import { DijkstraNode, Position } from '@helpers/types/helpers.types';

describe('Map & Pathfinding Utils', () => {

  describe('getAdjacentPositions', () => {
    it('devrait retourner exactement les 4 positions cardinales autour de la position donnée', () => {
      const center = { x: 5, y: 5 };
      const neighbors = getAdjacentPositions(center);

      expect(neighbors).toHaveLength(4);
      expect(neighbors).toContainEqual({ x: 5, y: 4 }); // Haut
      expect(neighbors).toContainEqual({ x: 5, y: 6 }); // Bas
      expect(neighbors).toContainEqual({ x: 4, y: 5 }); // Gauche
      expect(neighbors).toContainEqual({ x: 6, y: 5 }); // Droite
    });
  });

  describe('toPosKey', () => {
    it('devrait sérialiser correctement une position en string pour les Map/Set', () => {
      expect(toPosKey({ x: 0, y: 0 })).toBe('0,0');
      expect(toPosKey({ x: -5, y: 12 })).toBe('-5,12');
    });
  });

  describe('isSamePosition', () => {
    it('devrait valider l equality des coordonnées', () => {
      expect(isSamePosition({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
      expect(isSamePosition({ x: 1, y: 2 }, { x: 9, y: 2 })).toBe(false); // X différent
      expect(isSamePosition({ x: 1, y: 2 }, { x: 1, y: 9 })).toBe(false); // Y différent
    });
  });

  describe('reconstructPath', () => {
    it('devrait retourner un tableau vide si le endNode est null', () => {
      expect(reconstructPath(null)).toEqual([]);
    });

    it('devrait remonter la chaîne de parents à l envers et exclure le nœud de départ', () => {
      // Simulation d'une chaîne : Départ (0,0) -> Étape (1,0) -> Arrivée (2,0)
      const startNode: DijkstraNode = { position: { x: 0, y: 0 }, parent: null, distance: 0 };
      const stepNode: DijkstraNode = { position: { x: 1, y: 0 }, parent: startNode, distance: 1 };
      const endNode: DijkstraNode = { position: { x: 2, y: 0 }, parent: stepNode, distance: 2 };

      const result = reconstructPath(endNode);

      // Le chemin ne doit pas contenir le départ (0,0) puisqu'on y est déjà !
      expect(result).toEqual([
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ]);
    });
  });

  describe('isAdjacent', () => {
    it('devrait retourner true pour des cases adjacentes', () => {
      const center = { x: 2, y: 2 };
      expect(isAdjacent(center, { x: 2, y: 1 })).toBe(true); // Haut
      expect(isAdjacent(center, { x: 2, y: 3 })).toBe(true); // Bas
    });

    it('devrait retourner false pour la même case', () => {
      expect(isAdjacent({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe(false);
    });

    it('devrait retourner false pour des cases éloignées alignées ou hors de portée', () => {
      expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 2 })).toBe(false); // Trop loin sur Y
      expect(isAdjacent({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(false); // Trop loin sur X
    });
  });

  describe('runDijkstra', () => {
    it('devrait retourner un tableau vide si le départ et la cible sont la même position', () => {
      const pos = { x: 3, y: 3 };
      const path = runDijkstra(pos, pos, []);
      expect(path).toEqual([]);
    });

    it('devrait retourner un tableau vide si le point de départ est complètement muré', () => {
      const start = { x: 1, y: 1 };
      const target = { x: 5, y: 5 };
      const obstacles: Position[] = [
        { x: 1, y: 0 }, // Bloqué Haut
        { x: 1, y: 2 }, // Bloqué Bas
        { x: 0, y: 1 }, // Bloqué Gauche
        { x: 2, y: 1 }  // Bloqué Droite
      ];

      const path = runDijkstra(start, target, obstacles);
      expect(path).toEqual([]);
    });

    it('devrait trouver le chemin le plus court sans obstacle', () => {
      const path = runDijkstra({ x: 0, y: 0 }, { x: 2, y: 0 }, []);
      expect(path).toEqual([{ x: 1, y: 0 }, { x: 2, y: 0 }]);
    });

    it('devrait contourner un obstacle s il bloque le chemin direct', () => {
      const path = runDijkstra({ x: 0, y: 1 }, { x: 2, y: 1 }, [{ x: 1, y: 1 }]);
      expect(path[0]).not.toEqual({ x: 1, y: 1 });
      expect(path[path.length - 1]).toEqual({ x: 2, y: 1 });
    });

    it('devrait ignorer l obstacle si c est la cible elle-même', () => {
      const path = runDijkstra({ x: 0, y: 0 }, { x: 1, y: 0 }, [{ x: 1, y: 0 }]);
      expect(path).toEqual([{ x: 1, y: 0 }]);
    });
  });

});
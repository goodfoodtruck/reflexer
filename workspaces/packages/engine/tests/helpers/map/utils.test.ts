import { describe, it, expect } from 'vitest';
import { 
  isAdjacent, 
  getAdjacentPositions, 
  toPosKey, 
  isSamePosition,
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

});
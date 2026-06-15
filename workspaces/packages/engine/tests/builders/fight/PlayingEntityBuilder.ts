import { EntityStats, PlayingEntity } from "@fight/fight.types";

export const buildPlayingEntity = (overrides: Partial<PlayingEntity> = {}): PlayingEntity => {
    return {
        id: 'entity_default',
        name: 'CHARACTER_1',
        teamId: 'PLAYER',
        tags: [],
        position: { x: 0, y: 0 },
        isDead: false,
        baseStats: { health: 100, energy: 10, armor: 0 },
        currentStats: { health: 100, energy: 10, armor: 0 },
        gambits: [],
        activePassives: [],
        ...overrides
    }
}

export function withCurrentStats(entity: PlayingEntity, stats: Partial<EntityStats>): PlayingEntity {
    return {
        ...entity,
        currentStats: {
            ...entity.currentStats,
            ...stats
        }
    }
}

export function withBaseStats(entity: PlayingEntity, stats: Partial<EntityStats>): PlayingEntity {
    return {
        ...entity,
        baseStats: {
            ...entity.baseStats,
            ...stats
        }
    }
}
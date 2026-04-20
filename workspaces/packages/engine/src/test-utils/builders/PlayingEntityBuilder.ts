import { PlayingEntity } from "@fight/fight.types";

export function buildPlayingEntity(overrides: Partial<PlayingEntity> = {}): PlayingEntity {
    return {
        id: 'entity_default',
        teamId: 'PLAYER',
        tags: [],
        position: { x: 0, y: 0 },
        isDead: false,
        baseStats: { health: 100, energy: 10 },
        currentStats: { health: 100, energy: 10},
        passives: [],
        gambits: [],
        ...overrides
    }
}
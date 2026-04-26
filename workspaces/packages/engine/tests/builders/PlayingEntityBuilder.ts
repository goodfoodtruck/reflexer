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
        gambits: [],
        statuses: [],
        takeDamage(amount: number): number {
            if (amount < 0) throw new Error(`takeDamage expects a non-negative amount, got ${amount}`)

            const actualDamage = Math.min(amount, this.currentStats.health)
            this.currentStats.health -= actualDamage

            if (this.currentStats.health <= 0) this.isDead = true

            return actualDamage
        },
        ...overrides
    }
}
import { describe, it, expect } from 'vitest'
import { FightEntitiesValidator } from './FightEntitiesValidator'
import { buildPlayingEntity } from '@test-utils/builders/PlayingEntityBuilder'

describe("Un combat ne peut démarrer qu'avec des équipes valides", () => {

    const validator = new FightEntitiesValidator()

    describe('ensureNotEmpty', () => {
        it("lève une erreur si la liste d'entités est vide", () => {
            expect(() => validator.validate([])).toThrow()
        })

        it("ne lève pas d'erreur si au moins une entité est présente", () => {
            const entities = [
                buildPlayingEntity({ teamId: 'PLAYER' }),
                buildPlayingEntity({ teamId: 'ENEMY' }),
            ]
            expect(() => validator.validate(entities)).not.toThrow()
        })
    })

    describe('ensureMultipleTeams', () => {
        it("lève une erreur si toutes les entités sont dans la même équipe", () => {
            const entities = [
                buildPlayingEntity({ id: 'entity_a', teamId: 'PLAYER' }),
                buildPlayingEntity({ id: 'entity_b', teamId: 'PLAYER' }),
            ]
            expect(() => validator.validate(entities)).toThrow()
        })

        it("ne lève pas d'erreur si au moins deux équipes sont présentes", () => {
            const entities = [
                buildPlayingEntity({ id: 'entity_a', teamId: 'PLAYER' }),
                buildPlayingEntity({ id: 'entity_b', teamId: 'ENEMY' }),
            ]
            expect(() => validator.validate(entities)).not.toThrow()
        })
    })

    describe('ensureTeamSizeLimit', () => {
        it("lève une erreur si une équipe dépasse 8 entités", () => {
            const entities = [
                ...Array.from({ length: 9 }, (_, i) =>
                    buildPlayingEntity({ id: `enemy_${i}`, teamId: 'ENEMY' })
                ),
                buildPlayingEntity({ id: 'player', teamId: 'PLAYER' }),
            ]
            expect(() => validator.validate(entities)).toThrow()
        })

        it("accepte exactement 8 entités par équipe", () => {
            const entities = [
                ...Array.from({ length: 8 }, (_, i) =>
                    buildPlayingEntity({ id: `enemy_${i}`, teamId: 'ENEMY' })
                ),
                ...Array.from({ length: 8 }, (_, i) =>
                    buildPlayingEntity({ id: `player_${i}`, teamId: 'PLAYER' })
                ),
            ]
            expect(() => validator.validate(entities)).not.toThrow()
        })

        it("lève une erreur en précisant quelle équipe dépasse la limite", () => {
            const entities = [
                ...Array.from({ length: 9 }, (_, i) =>
                    buildPlayingEntity({ id: `enemy_${i}`, teamId: 'ENEMY' })
                ),
                buildPlayingEntity({ id: 'player', teamId: 'PLAYER' }),
            ]
            expect(() => validator.validate(entities)).toThrow(/ENEMY/)
        })
    })
})
import { describe, it, expect } from 'vitest'
import { buildFightMap } from '@test-utils/builders/FightMapBuilder'
import { buildPlayingEntity } from '@test-utils/builders/PlayingEntityBuilder'
import { FightContext } from '@fight/context/FightContext'

describe('FightContext.nextEntityTurn', () => {
    it("avance l'index d'initiative au suivant", () => {
        const entities = [
            buildPlayingEntity({ id: 'entity_a' }),
            buildPlayingEntity({ id: 'entity_b' }),
            buildPlayingEntity({ id: 'entity_c' }),
        ]
        const context = new FightContext(entities, buildFightMap())

        expect(context.getActingEntity()?.id).toBe('entity_a')
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).toBe('entity_b')
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).toBe('entity_c')
    })

    it("revient à 0 après le dernier index — cycle complet", () => {
        const entities = [
            buildPlayingEntity({ id: 'entity_a' }),
            buildPlayingEntity({ id: 'entity_b' }),
        ]
        const context = new FightContext(entities, buildFightMap())

        context.nextEntityTurn()
        context.nextEntityTurn()

        expect(context.getActingEntity()?.id).toBe('entity_a')
    })

    it("saute les entités mortes lors du cycle", () => {
        const entities = [
            buildPlayingEntity({ id: 'entity_a' }),
            buildPlayingEntity({ id: 'entity_b', isDead: true }),
            buildPlayingEntity({ id: 'entity_c' }),
        ]
        const context = new FightContext(entities, buildFightMap())

        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).toBe('entity_c')
    })

    it("retourne null si toutes les entités sont mortes", () => {
        const entities = [
            buildPlayingEntity({ id: 'entity_a', isDead: true }),
            buildPlayingEntity({ id: 'entity_b', isDead: true }),
        ]
        const context = new FightContext(entities, buildFightMap())

        expect(context.getActingEntity()).toBeNull()
    })

    it("isNewTurn retourne true uniquement quand l'index revient à 0", () => {
        const entities = [
            buildPlayingEntity({ id: 'entity_a' }),
            buildPlayingEntity({ id: 'entity_b' }),
        ]
        const context = new FightContext(entities, buildFightMap())

        context.nextEntityTurn() // on passe à l'index 1
        expect(context.isNewTurn()).toBe(false)
        context.nextEntityTurn() // on revient à l'index 0
        expect(context.isNewTurn()).toBe(true)
    })
})
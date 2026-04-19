import { describe, it, expect } from 'vitest'
import { buildFightMap } from '@test-utils/builders/FightMapBuilder'
import { buildPlayingEntity } from '@test-utils/builders/PlayingEntityBuilder'
import { FightContext } from '@fight/context/FightContext'
import { PlayingEntity } from '@fight/fight.types'

const buildContext = (playerOverrides: Partial<PlayingEntity>[] = [{}], enemyOverrides: Partial<PlayingEntity>[] = [{}]): FightContext => {
    const players = playerOverrides.map((playerEntity, i) => 
        buildPlayingEntity({ id: `player_${i}`, teamId: 'PLAYER', ...playerEntity })
    )
    const enemies = enemyOverrides.map((enemyEntity, i) => 
        buildPlayingEntity({ id: `enemy_${i}`, teamId: 'ENEMY', ...enemyEntity })
    )
    return new FightContext([...players, ...enemies], buildFightMap())
}



describe('FightContext.nextEntityTurn', () => {

    it("avance l'index d'initiative au suivant", () => {
        const context = buildContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        const first = context.getActingEntity()?.id
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).not.toBe(first)
    })

    it("revient à 0 après le dernier index — cycle complet", () => {
        const context = buildContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        const first = context.getActingEntity()?.id
        context.nextEntityTurn()
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).toBe(first)
    })

    it("saute les entités mortes lors du cycle", () => {
        const context = buildContext(
            [{ id: 'player_a', isDead: true }],
            [{ id: 'enemy_a' }]
        )
        expect(context.getActingEntity()?.id).toBe('enemy_a')
    })

    it("retourne null si toutes les entités sont mortes", () => {
        const context = buildContext(
            [{ id: 'player_a', isDead: true }],
            [{ id: 'enemy_a', isDead: true }]
        )
        expect(context.getActingEntity()).toBeNull()
    })

    it("isNewTurn retourne true uniquement quand l'index revient à 0", () => {
        const context = buildContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        context.nextEntityTurn()
        expect(context.isNewTurn()).toBe(false)
        context.nextEntityTurn()
        expect(context.isNewTurn()).toBe(true)
    })
})



describe('FightContext.getActingEntity', () => {
    
    it("retourne la première entité dans l'ordre d'initiative", () => {
        const context = buildContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        expect(context.getActingEntity()).not.toBeNull()
    })

    it("retourne la bonne entité après avoir avancé l'index", () => {
        const context = buildContext([{ id: 'player_a' }], [{ id: 'enemy_a' }, { id: 'enemy_b' }])
        const first = context.getActingEntity()?.id
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).not.toBe(first)
    })

    it("saute les entités mortes et retourne la suivante vivante", () => {
        const context = buildContext(
            [{ id: 'player_a', isDead: true }],
            [{ id: 'enemy_a' }]
        )
        expect(context.getActingEntity()?.id).toBe('enemy_a')
    })

    it("saute plusieurs entités mortes consécutives", () => {
        const context = buildContext(
            [{ id: 'player_a', isDead: true }, { id: 'player_b', isDead: true }],
            [{ id: 'enemy_a' }]
        )
        expect(context.getActingEntity()?.id).toBe('enemy_a')
    })

    it("retourne null si toutes les entités sont mortes", () => {
        const context = buildContext(
            [{ id: 'player_a', isDead: true }],
            [{ id: 'enemy_a', isDead: true }]
        )
        expect(context.getActingEntity()).toBeNull()
    })

    it("revient sur la première entité vivante après un cycle complet", () => {
        const context = buildContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        const first = context.getActingEntity()?.id
        context.nextEntityTurn()
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).toBe(first)
    })

    it("retourne la première entité vivante après qu'une entité soit morte en cours de cycle", () => {
        const context = buildContext(
            [{ id: 'player_a' }],
            [{ id: 'enemy_a' }, { id: 'enemy_b' }]
        )

        // on avance sur enemy_a et on le tue
        context.nextEntityTurn()
        context.getEntityById('enemy_a')!.isDead = true

        // le contexte doit sauter le tour de enemy_a et retourner enemy_b
        expect(context.getActingEntity()?.id).toBe('enemy_b')
    })
})
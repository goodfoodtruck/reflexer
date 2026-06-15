import { describe, it, expect } from 'vitest'
import { buildFightContext } from '@tests/builders/fight/FightContextBuilder'


describe("Récupérer l'entité dont c'est le tour de jouer", () => {
    
    it("retourne la première entité dans l'ordre d'initiative", () => {
        const context = buildFightContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        expect(context.getActingEntity()).not.toBeNull()
    })

    it("retourne la bonne entité après avoir avancé l'index", () => {
        const context = buildFightContext([{ id: 'player_a' }], [{ id: 'enemy_a' }, { id: 'enemy_b' }])
        const first = context.getActingEntity()?.id
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).not.toBe(first)
    })

    it("revient à 0 après le dernier index — cycle complet", () => {
        const context = buildFightContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        const first = context.getActingEntity()?.id
        context.nextEntityTurn()
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).toBe(first)
    })

    it("saute une entité morte et retourne la suivante vivante", () => {
        const context = buildFightContext(
            [{ id: 'player_a', isDead: true }],
            [{ id: 'enemy_a' }]
        )
        expect(context.getActingEntity()?.id).toBe('enemy_a')
    })

    it("saute plusieurs entités mortes consécutives", () => {
        const context = buildFightContext(
            [{ id: 'player_a', isDead: true }, { id: 'player_b', isDead: true }],
            [{ id: 'enemy_a' }]
        )
        expect(context.getActingEntity()?.id).toBe('enemy_a')
    })

    it("retourne null si toutes les entités sont mortes", () => {
        const context = buildFightContext(
            [{ id: 'player_a', isDead: true }],
            [{ id: 'enemy_a', isDead: true }]
        )
        expect(context.getActingEntity()).toBeNull()
    })

    it("revient sur la première entité vivante après un cycle complet", () => {
        const context = buildFightContext([{ id: 'player_a' }], [{ id: 'enemy_a' }])
        const first = context.getActingEntity()?.id
        context.nextEntityTurn()
        context.nextEntityTurn()
        expect(context.getActingEntity()?.id).toBe(first)
    })

    it("retourne la première entité vivante après qu'une entité soit morte en cours de cycle", () => {
        const context = buildFightContext(
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
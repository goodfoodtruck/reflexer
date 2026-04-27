import { describe, it, expect } from 'vitest'
import { ActionID } from '@fight/fight.types'
import { setupFight } from "@tests/helpers/setupFight";
import { makeCtx } from "@tests/helpers/makeCtx";
import { buildAction } from "@tests/helpers/buildAction";
import { buildFightContext } from "@tests/builders/FightContextBuilder";

describe('Infliger des dégâts', () => {
    it('réduit les PV de la cible du montant infligé', () => {
        const { fightContext, executor } = setupFight({
            players: [{ currentStats: { health: 100, energy: 10 } }],
            enemies: [{ currentStats: { health: 100, energy: 10 } }],
            actions: {
                strike: buildAction({
                    id: 'strike',
                    configs: [{ processorId: 'damage', params: { damage_value: 20 } }],
                }),
            },
        })

        executor.execute(
            makeCtx({
                actionId: 'strike' as ActionID,
                casterId: 'player_0',
                targetId: 'enemy_0',
            }),
            fightContext,
        )

        expect(fightContext.getEntityById('enemy_0')!.currentStats.health).toBe(80)
    })

    it('ne descend jamais les PV en dessous de zéro', () => {
        const fightContext = buildFightContext(
            [{}],
            [{ currentStats: { health: 20, energy: 0 } }],
        )

        const result = fightContext.applyDamage({
            sourceId: 'player_0',
            targetId: 'enemy_0',
            amount: 999,
        })

        expect(result.actualDamage).toBe(20)
        expect(fightContext.getEntityById('enemy_0')!.currentStats.health).toBe(0)
    })

    it('marque l\'entité comme morte quand ses PV atteignent zéro', () => {
        const fightContext = buildFightContext(
            [{}],
            [{ currentStats: { health: 10, energy: 0 } }],
        )

        fightContext.applyDamage({ sourceId: 'player_0', targetId: 'enemy_0', amount: 10 })

        expect(fightContext.getEntityById('enemy_0')!.isDead).toBe(true)
    })

    it('ne s\'applique pas si la cible est déjà morte', () => {
        const { fightContext, executor } = setupFight({
            players: [{}],
            enemies: [{ isDead: true, currentStats: { health: 0, energy: 0 } }],
            actions: {
                strike: buildAction({
                    id: 'strike',
                    configs: [{ processorId: 'damage', params: { damage_value: 20 } }],
                }),
            },
        })

        const logs = executor.execute(
            makeCtx({
                actionId: 'strike' as ActionID,
                casterId: 'player_0',
                targetId: 'enemy_0',
            }),
            fightContext,
        )

        expect(logs).toContainEqual(
            expect.objectContaining({ type: 'damage_skipped', reason: 'target_already_dead' }),
        )
        expect(fightContext.getEntityById('enemy_0')!.currentStats.health).toBe(0)
    })

    it('rapporte les dégâts effectivement subis (pas le montant brut)', () => {
        const fightContext = buildFightContext(
            [{}],
            [{ currentStats: { health: 5, energy: 0 } }],
        )

        const result = fightContext.applyDamage({
            sourceId: 'player_0',
            targetId: 'enemy_0',
            amount: 100,
        })

        expect(result.actualDamage).toBe(5)
    })
})
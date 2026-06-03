import { describe, it, expect } from 'vitest'
import { ActionID } from '@fight/fight.types'
import { setupFight } from "@tests/helpers/setupFight";
import { buildAction } from "@tests/helpers/buildAction";
import { makeActionCtx } from '@tests/helpers/makeCtx';

describe('Mort d\'une entité', () => {

    it('génère un log entity_died à l\'instant de la mort', () => {
        const { fightContext, executor } = setupFight({
            players: [{}],
            enemies: [{ currentStats: { health: 10, energy: 0, armor: 0 } }],
            actions: {
                strike: buildAction({
                    id: 'strike',
                    configs: [
                        { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                        { type: 'apply_damage', order: 1, params: {} }
                    ],
                }),
            },
        })

        executor.execute(
            makeActionCtx({ actionId: 'strike' as ActionID, casterId: 'player_0', targetId: 'enemy_0' }),
            fightContext,
        )

        expect(fightContext.getFightLogs()).toContainEqual(
            expect.objectContaining({ type: 'entity_died', entityId: 'enemy_0' })
        )
    })

    it('skip les processors restants ciblant l\'entité morte', () => {
        const { fightContext, executor } = setupFight({
            players: [{}],
            enemies: [{ currentStats: { health: 10, energy: 0, armor: 0 } }],
            actions: {
                doubleStrike: buildAction({
                    id: 'doubleStrike',
                    configs: [
                        { type: 'compute_damage', order: 1, params: { initialDamage: 20 } },
                        { type: 'apply_damage', order: 1, params: { initialDamage: 20 } },
                        // celui ci devrait être skip
                        { type: 'apply_damage', order: 2, params: { initialDamage: 20 } }
                    ],
                }),
            },
        })

        executor.execute(
            makeActionCtx({ actionId: 'doubleStrike' as ActionID, casterId: 'player_0', targetId: 'enemy_0' }),
            fightContext,
        )

        console.log(fightContext.getFightLogs());
        

        const skippedLogs = fightContext.getFightLogs().filter(l => l.type === 'damage_skipped')
        expect(skippedLogs.length).toBeGreaterThanOrEqual(1)
    })

    it('marque définitivement isDead à true', () => {
        const { fightContext, executor } = setupFight({
            players: [{}],
            enemies: [{ currentStats: { health: 10, energy: 0, armor: 0 } }],
            actions: {
                strike: buildAction({
                    id: 'strike',
                    configs: [
                        { type: 'compute_damage', order: 1, params: { initialDamage: 20 } },
                        { type: 'apply_damage', order: 1, params: {} }
                    ],
                }),
            },
        })

        executor.execute(
            makeActionCtx({ actionId: 'strike' as ActionID, casterId: 'player_0', targetId: 'enemy_0' }),
            fightContext,
        )

        expect(fightContext.getEntityById('enemy_0')!.isDead).toBe(true)
    })
})
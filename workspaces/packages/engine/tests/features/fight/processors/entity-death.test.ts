import { describe, it, expect } from 'vitest'
import { ActionID } from '@fight/fight.types'
import { setupFight } from "@tests/helpers/setupFight";
import { makeCtx } from "@tests/helpers/makeCtx";
import { buildAction } from "@tests/helpers/buildAction";

describe('Mort d\'une entité', () => {
    it('génère un log entity_died à l\'instant de la mort', () => {
        const { fightContext, executor } = setupFight({
            players: [{}],
            enemies: [{ currentStats: { health: 10, energy: 0 } }],
            actions: {
                strike: buildAction({
                    id: 'strike',
                    configs: [{ type: 'damage', order: 1, params: { damage_value: 20 } }],
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
            expect.objectContaining({ type: 'entity_died', entityId: 'enemy_0' }),
        )
    })

    it('skip les processors restants ciblant l\'entité morte', () => {
        const { fightContext, executor } = setupFight({
            players: [{}],
            enemies: [{ currentStats: { health: 10, energy: 0 } }],
            actions: {
                doubleStrike: buildAction({
                    id: 'doubleStrike',
                    configs: [
                        { type: 'damage', order: 1, params: { damage_value: 20 } },
                        { type: 'damage', order: 2, params: { damage_value: 20 } }
                    ],
                }),
            },
        })

        const logs = executor.execute(
            makeCtx({
                actionId: 'doubleStrike' as ActionID,
                casterId: 'player_0',
                targetId: 'enemy_0',
            }),
            fightContext,
        )

        const skippedLogs = logs.filter(l => l.type === 'damage_skipped')
        expect(skippedLogs.length).toBeGreaterThanOrEqual(1)
    })

    it('marque définitivement isDead à true', () => {
        const { fightContext, executor } = setupFight({
            players: [{}],
            enemies: [{ currentStats: { health: 10, energy: 0 } }],
            actions: {
                strike: buildAction({
                    id: 'strike',
                    configs: [{ type: 'damage', order: 1, params: { damage_value: 20 } }],
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

        expect(fightContext.getEntityById('enemy_0')!.isDead).toBe(true)
    })
})
import { describe, expect, it } from "vitest";
import { ProcessorChain } from "@processors/ProcessorChain";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { EntityMovementExecutor } from "@fight/turn-executors/EntityMovementExecutor";
import { Position } from "@helpers/types/helpers.types";
import { EObstacleType } from "@fight/fight.types";

describe("Exécution d'un mouvement", _ => {

    it("déplace l'entité sur chaque case du chemin", _ => {
        const fightContext = buildFightContext([{ id: 'player_0', position: { x: 0, y: 0 } }], [])

        const executor = new EntityMovementExecutor(new ProcessorChain())
        const path: Position[] = [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 }
        ]

        const logs = executor.execute(
            path,
            { casterId: 'player_0', targetId: 'player_0', strategy: 'APPROACH' },
            fightContext
        )

        expect(fightContext.getEntityById('player_0')!.position).toEqual({ x: 3, y: 0 })
        expect(logs.filter(l => l.type === 'entity_moved')).toHaveLength(3)
    });

    it("ne peut pas déplacer l'entité sur une case non praticable", _ => {
        const fightContext = buildFightContext(
            [{ id: 'player_0', position: { x: 0, y: 0 } }], [],
            {
                cells: [
                    [EObstacleType.FLOOR, EObstacleType.WALL,  EObstacleType.FLOOR],
                    [EObstacleType.FLOOR, EObstacleType.FLOOR, EObstacleType.FLOOR]
                ]
            }
        )

        const executor = new EntityMovementExecutor(new ProcessorChain())
        const path: Position[] = [
            { x: 1, y: 0 }  // WALL
        ]

        const logs = executor.execute(
            path,
            { casterId: 'player_0', targetId: 'player_0', strategy: 'APPROACH' },
            fightContext
        )

        expect(fightContext.getEntityById('player_0')!.position).toEqual({ x: 0, y: 0 })
        expect(logs).toContainEqual(
            expect.objectContaining({ type: 'action_failed' })
        )
    });

    it("ne peut pas déplacer l'entité sur une case trop loin", _ => {
        const fightContext = buildFightContext([{ id: 'player_0', position: { x: 0, y: 0 } }], [])

        const executor = new EntityMovementExecutor(new ProcessorChain())
        const path: Position[] = [
            { x: 5, y: 0 }  // saut direct sans cases intermédiaires
        ]

        const logs = executor.execute(
            path,
            { casterId: 'player_0', targetId: 'player_0', strategy: 'APPROACH' },
            fightContext
        )

        expect(fightContext.getEntityById('player_0')!.position).toEqual({ x: 0, y: 0 })
        expect(logs).toContainEqual(
            expect.objectContaining({ type: 'action_failed' })
        )
    });
});
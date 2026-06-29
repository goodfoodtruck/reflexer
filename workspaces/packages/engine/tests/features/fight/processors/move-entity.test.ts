import { describe, expect, it } from "vitest"
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder"
import { EntityMovementExecutor } from "@fight/turn-executors/EntityMovementExecutor"
import { ActionChainExecutor } from "@fight/turn-executors/ActionChainExecutor"
import { ProcessorChain, ProcessorFactory } from "@fight/processors"
import { FilterApplier, EntityScopeResolver, GambitTargetResolver, ConditionResolver, buildFilterRegistry } from "@fight/gambits"
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver"
import { Position } from "@helpers/types/helpers.types"
import { EObstacleType } from "@fight/map/fight.map.types"

describe("Exécution d'un mouvement", () => {

    const buildExecutor = () => {
        const filterApplier = new FilterApplier(buildFilterRegistry())
        const entityScopeResolver = new EntityScopeResolver()
        const conditionResolver = new ConditionResolver(filterApplier, entityScopeResolver)
        const targetResolver = new GambitTargetResolver(conditionResolver, entityScopeResolver)
        const triggeredPassiveResolver = new TriggeredPassiveResolver(targetResolver)
        const processorFactory = new ProcessorFactory({ getPassive: () => { throw new Error("not implemented") } })
        const processorChain = new ProcessorChain()

        const actionChainExecutor = new ActionChainExecutor(
            processorFactory,
            { get: () => { throw new Error("action not found") } },
            triggeredPassiveResolver,
            processorChain
        )

        return new EntityMovementExecutor(actionChainExecutor)
    }

    it("déplace l'entité sur chaque case du chemin", () => {
        const fightContext = buildFightContext([{ id: "player_0", position: { x: 0, y: 0 } }], [])
        const executor = buildExecutor()
        const path: Position[] = [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }]

        executor.execute(path, {
            casterId: "player_0",
            targetPosition: {
                x: 3,
                y: 0
            },
            strategy: "APPROACH"
        }, fightContext)

        expect(fightContext.getEntityById("player_0")!.position).toEqual({ x: 3, y: 0 })
        expect(fightContext.getFightLogs().filter(l => l.type === "entity_moved")).toHaveLength(3)
    })

    it("ne peut pas déplacer l'entité sur une case non praticable", () => {
        const fightContext = buildFightContext(
            [{ id: "player_0", position: { x: 0, y: 0 } }], [],
            {
                cells: [
                    [EObstacleType.FLOOR, EObstacleType.WALL,  EObstacleType.FLOOR],
                    [EObstacleType.FLOOR, EObstacleType.FLOOR, EObstacleType.FLOOR]
                ]
            }
        )
        const executor = buildExecutor()
        const path: Position[] = [{ x: 1, y: 0 }]

        executor.execute(path, {
            casterId: "player_0",
            targetPosition: {
                x: 1,
                y: 0
            },
            strategy: "APPROACH"
        }, fightContext)

        expect(fightContext.getEntityById("player_0")!.position).toEqual({ x: 0, y: 0 })
        expect(fightContext.getFightLogs()).toContainEqual(
            expect.objectContaining({ type: "action_failed" })
        )
    })

    it("ne peut pas déplacer l'entité sur une case trop loin", () => {
        const fightContext = buildFightContext([{ id: "player_0", position: { x: 0, y: 0 } }], [])
        const executor = buildExecutor()
        const path: Position[] = [{ x: 5, y: 0 }]

        executor.execute(path, {
            casterId: "player_0",
            targetPosition: {
                x: 5,
                y: 0
            },
            strategy: "APPROACH"
        }, fightContext)

        expect(fightContext.getEntityById("player_0")!.position).toEqual({ x: 0, y: 0 })
        expect(fightContext.getFightLogs()).toContainEqual(
            expect.objectContaining({ type: "action_failed" })
        )
    })
})
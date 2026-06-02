import { FightContextFactory } from "@fight/context/FightContextFactory"
import { FightContextFactoryDeps } from "@fight/fight.types"
import { FightMapConfig, EFightMapSize } from "@fight/map/fight.map.types"
import { NbPlayerByTeam } from "@fight/value-objects/NbPlayerByTeam"
import { PveFightConfig, TeamMemberData } from "@game-engine/game-engine.types"
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder"
import { describe, it, expect } from "vitest"

const defaultDeps: FightContextFactoryDeps = {
    validator:                { validate: () => {} },
    nbEnemiesResolver:        { resolve: () => new NbPlayerByTeam(2) },
    enemyBuilder:             { buildEnemy: (tag, position, index) => buildPlayingEntity({ id: `${tag}_${index}`, teamId: "ENEMY", position }) },
    enemyCompositionResolver: { resolve: () => ["ENEMY_MELEE", "ENEMY_MELEE"] },
    teamBuilder:              { buildTeam: (members, positions, teamId) =>
        members.map((member, i) => buildPlayingEntity({
            id: `${teamId.toLowerCase()}_${i}`,
            teamId,
            position: positions[i]!,
            gambits: member.gambits,
            baseStats: member.baseStats,
            currentStats: member.baseStats
        }))
    },
}

describe("FightContextFactory — construction des entités", () => {

    const buildFactory = (overrides: Partial<FightContextFactoryDeps> = {}): FightContextFactory =>
        new FightContextFactory({ ...defaultDeps, ...overrides })

    const buildMapConfig = (): FightMapConfig => ({
        id: "fight_map_1",
        size: EFightMapSize.SMALL_RANGE,
        cells: [],
        dimensions: { width: 10, height: 10 },
        spawnPoints: {
            player: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
            enemy: [
                { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 },
                { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }
            ]
        }
    })

    const buildPlayerTeam = (): TeamMemberData[] => [
        { name: "CHARACTER_1", baseStats: { health: 100, energy: 10 }, gambits: [], activePassiveIds: [] },
        { name: "CHARACTER_2", baseStats: { health: 100, energy: 10 }, gambits: [], activePassiveIds: [] }
    ]

    const buildPveFightConfig = (overrides: Partial<PveFightConfig> = {}): PveFightConfig => ({
        type: "PVE",
        mapConfig: buildMapConfig(),
        playerTeam: buildPlayerTeam(),
        floorIndex: 1,
        ...overrides
    })

    describe("Construction des alliés", () => {

        it("crée autant d'alliés que de personnages dans la composition", () => {
            const context = buildFactory().create(buildPveFightConfig())
            const allies = context.getAliveEntitiesByTeam("PLAYER")
            expect(allies).toHaveLength(2)
        })

        it("place chaque allié sur le bon spawn point", () => {
            const context = buildFactory().create(buildPveFightConfig())
            const allies = context.getAliveEntitiesByTeam("PLAYER")
            expect(allies.at(0)!.position).toEqual({ x: 0, y: 0 })
            expect(allies.at(1)!.position).toEqual({ x: 1, y: 0 })
        })

        it("assigne le bon teamId aux alliés", () => {
            const context = buildFactory().create(buildPveFightConfig())
            const allies = context.getAliveEntitiesByTeam("PLAYER")
            expect(allies.every(a => a.teamId === "PLAYER")).toBe(true)
        })
    })

    describe("Construction des ennemis", () => {

        it("crée autant d'ennemis que défini par la composition", () => {
            const context = buildFactory().create(buildPveFightConfig())
            const enemies = context.getAliveEntitiesByTeam("ENEMY")
            expect(enemies).toHaveLength(2)
        })

        it("place chaque ennemi sur le bon spawn point", () => {
            const context = buildFactory().create(buildPveFightConfig())
            const enemies = context.getAliveEntitiesByTeam("ENEMY")
            expect(enemies.at(0)!.position).toEqual({ x: 5, y: 5 })
            expect(enemies.at(1)!.position).toEqual({ x: 6, y: 5 })
        })

        it("assigne le bon teamId aux ennemis", () => {
            const context = buildFactory().create(buildPveFightConfig())
            const enemies = context.getAliveEntitiesByTeam("ENEMY")
            expect(enemies.every(e => e.teamId === "ENEMY")).toBe(true)
        })

        it("crée plus d'ennemis à un étage élevé", () => {
            const factory = buildFactory({
                nbEnemiesResolver: { resolve: () => new NbPlayerByTeam(6) },
                enemyCompositionResolver: { resolve: () => Array(6).fill("ENEMY_MELEE") }
            })
            const context = factory.create(buildPveFightConfig({ floorIndex: 8 }))
            expect(context.getAliveEntitiesByTeam("ENEMY")).toHaveLength(6)
        })
    })
})
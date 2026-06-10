import { IActionRegistry } from "@data/IActionRegistry";
import { IPassiveRegistry } from "@data/IPassiveRegistry";
import { Action, ActionID, PlayingEntityID } from "@fight/fight.types";
import { EntityScopeResolver, ETargetType, FilterApplier, FilterEvaluatorRegistry, GambitTargetResolver } from "@fight/gambits";
import { ActivePassive, ModifierPassive, PassiveConfig, TriggeredPassive } from "@fight/passives/passives.types";
import { TriggeredPassiveResolver } from "@fight/passives/TriggeredPassiveResolver";
import { ProcessorFactory, ProcessorChain } from "@fight/processors";
import { ActionChainExecutor } from "@fight/turn-executors";
import { buildFightContext } from "@tests/builders/fight/FightContextBuilder";
import { buildPlayingEntity } from "@tests/builders/fight/PlayingEntityBuilder";
import { describe, expect, it } from "vitest";

describe("Exécuter une action et gérer ses effets de bord", () => {

    const permanentConfig: PassiveConfig = {
        duration: "PERMANENT",
        applicationStrategy: { type: "RESET" }
    }

    const buildActivePassive = (passive: TriggeredPassive | ModifierPassive, sourceEntityId: PlayingEntityID): ActivePassive => ({
        passive,
        remainingTurns: "PERMANENT",
        sourceEntityId
    })

    const buildExecutor = (overrides: {
        actionRegistry?: IActionRegistry
        targetResolver?: GambitTargetResolver
        passiveRegistry?: IPassiveRegistry
    } = {}) => {
        const filterEvaluatorRegistry = new FilterEvaluatorRegistry()
        const filterApplier = new FilterApplier(filterEvaluatorRegistry)
        const entityScopeResolver = new EntityScopeResolver()

        const passiveRegistry = overrides.passiveRegistry ?? { getPassive: () => { throw new Error("not implemented") } }
        const actionRegistry  = overrides.actionRegistry  ?? { get: () => { throw new Error("action not found") } }
        const targetResolver  = overrides.targetResolver  ?? new GambitTargetResolver(filterApplier, entityScopeResolver)

        const processorFactory = new ProcessorFactory(passiveRegistry)
        const processorChain   = new ProcessorChain()

        const triggeredPassiveResolver = new TriggeredPassiveResolver(targetResolver)

        return new ActionChainExecutor(
            processorFactory,
            actionRegistry,
            triggeredPassiveResolver,
            processorChain
        )
    }

    it("exécute une action simple sans réaction", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const executor = buildExecutor({
            actionRegistry: { get: () => basicAttack }
        })

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({ id: "gobelin", teamId: "ENEMY" })
        const fightContext = buildFightContext([mage], [gobelin])

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        expect(logs).toHaveLength(1)
        expect(logs[0]?.type).toBe("damage_dealt")
    })

    it("déclenche une réaction THORNS quand la cible reçoit des dégâts", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 3 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: {
                context: { targetType: ETargetType.ENEMY, filters: [] },
                sort: "LOWEST_HP"
            }
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack")        return basicAttack
                if (id === "thorns_retaliation")  return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const executor = buildExecutor({ actionRegistry })

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(thornsPassive, "gobelin")]
        })

        const fightContext = buildFightContext([mage], [gobelin])

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin",
            amount: 10
        })

        expect(logs[1]).toMatchObject({
            type: "damage_dealt",
            sourceId: "gobelin",
            targetId: "mage",
            amount: 3
        })

        const mageAfter = fightContext.getEntityById("mage")
        expect(mageAfter?.currentStats.health).toBe(mage.baseStats.health - 3)
    })

    it("arrête la chaîne de réactions au-delà de MAX_REACTION_DEPTH", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 5 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 2 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({
            id: "mage",
            teamId: "PLAYER",
            activePassives: [buildActivePassive(thornsPassive, "mage")]
        })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(thornsPassive, "gobelin")]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        expect(logs).toHaveLength(2)
        expect(logs[0]).toMatchObject({ sourceId: "mage",    targetId: "gobelin", amount: 5 })
        expect(logs[1]).toMatchObject({ sourceId: "gobelin", targetId: "mage",    amount: 2 })
    })

    it("déclenche un passif ON_DEATH quand l'entité meurt", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 100 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const deathExplosion: Action = {
            id: "death_explosion",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 5 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const explosionPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "explosion",
            config: permanentConfig,
            triggerType: "entity_died",
            triggeredActionId: "death_explosion",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack")    return basicAttack
                if (id === "death_explosion") return deathExplosion
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(explosionPassive, "gobelin")]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const initialMageHealth = mage.currentStats.health

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin"
        })

        const explosionLog = logs.find(log =>
            log.type === "damage_dealt" && log.sourceId === "gobelin" && log.targetId === "mage"
        )
        expect(explosionLog).toBeDefined()
        expect(explosionLog).toMatchObject({ amount: 5 })

        const mageAfter = fightContext.getEntityById("mage")
        expect(mageAfter?.currentStats.health).toBe(initialMageHealth - 5)
    })

    it("ne déclenche pas de réaction si la cible ne peut être résolue", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: {
                context: { targetType: ETargetType.ALLY, filters: [] },
                sort: "LOWEST_HP"
            }
        }

        const actionRegistry: IActionRegistry = {
            get: (id: ActionID) => {
                if (id === "basic_attack") return basicAttack
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(thornsPassive, "gobelin")]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        expect(logs).toHaveLength(1)
        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin"
        })
    })

    it("gère correctement une cible de réaction qui meurt en cours d'exécution", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 100 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(thornsPassive, "gobelin")]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        expect(logs[0]).toMatchObject({
            type: "damage_dealt",
            sourceId: "mage",
            targetId: "gobelin",
            amount: 10
        })

        expect(logs[1]).toMatchObject({
            type: "damage_dealt",
            sourceId: "gobelin",
            targetId: "mage",
            amount: 100
        })

        expect(logs).toContainEqual(expect.objectContaining({
            type: "entity_died",
            entityId: "mage"
        }))

        const mageAfter = fightContext.getEntityById("mage")
        expect(mageAfter?.isDead).toBe(true)
    })

    it("ne déclenche que les passifs de l'entité affectée, pas des entités tierces", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack") return basicAttack
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin_A = buildPlayingEntity({ id: "gobelin_A", teamId: "ENEMY" })
        const gobelin_B = buildPlayingEntity({
            id: "gobelin_B",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(thornsPassive, "gobelin_B")]
        })

        const fightContext = buildFightContext([mage], [gobelin_A, gobelin_B])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin_A",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")
        expect(damageLogs).toHaveLength(1)
        expect(damageLogs[0]).toMatchObject({
            sourceId: "mage",
            targetId: "gobelin_A"
        })
    })

    it("traite les réactions multiples dans l'ordre où elles sont enfilées", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 2 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin_A = buildPlayingEntity({
            id: "gobelin_A",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(thornsPassive, "gobelin_A")]
        })
        const gobelin_B = buildPlayingEntity({
            id: "gobelin_B",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(thornsPassive, "gobelin_B")]
        })

        const fightContext = buildFightContext([mage], [gobelin_A, gobelin_B])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin_A",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")

        expect(damageLogs).toHaveLength(2)
        expect(damageLogs[0]).toMatchObject({ sourceId: "mage",      targetId: "gobelin_A", amount: 10 })
        expect(damageLogs[1]).toMatchObject({ sourceId: "gobelin_A", targetId: "mage",      amount: 2 })
    })

    it("déclenche tous les passifs correspondants sur l'entité affectée", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 3 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const rageRetaliation: Action = {
            id: "rage_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 5 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const ragePassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "rage",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "rage_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                if (id === "rage_retaliation")   return rageRetaliation
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [
                buildActivePassive(thornsPassive, "gobelin"),
                buildActivePassive(ragePassive,   "gobelin")
            ]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")

        expect(damageLogs).toHaveLength(3)

        expect(damageLogs[0]).toMatchObject({ sourceId: "mage", targetId: "gobelin", amount: 10 })

        const ripostes = damageLogs.slice(1)
        expect(ripostes).toEqual(expect.arrayContaining([
            expect.objectContaining({ sourceId: "gobelin", targetId: "mage", amount: 3 }),
            expect.objectContaining({ sourceId: "gobelin", targetId: "mage", amount: 5 })
        ]))
    })

    it("ne déclenche que les passifs du bon trigger type", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsRetaliation: Action = {
            id: "thorns_retaliation",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 3 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const deathExplosion: Action = {
            id: "death_explosion",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { initialDamage: 100 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const thornsPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "thorns",
            config: permanentConfig,
            triggerType: "damage_dealt",
            triggeredActionId: "thorns_retaliation",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const explosionPassive: TriggeredPassive = {
            kind: "TRIGGERED",
            id: "explosion",
            config: permanentConfig,
            triggerType: "entity_died",
            triggeredActionId: "death_explosion",
            targetSelector: { context: { targetType: ETargetType.ENEMY, filters: [] }, sort: "LOWEST_HP" }
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack")       return basicAttack
                if (id === "thorns_retaliation") return thornsRetaliation
                if (id === "death_explosion")    return deathExplosion
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [
                buildActivePassive(thornsPassive,    "gobelin"),
                buildActivePassive(explosionPassive, "gobelin")
            ]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")

        expect(damageLogs).toHaveLength(2)
        expect(damageLogs[0]).toMatchObject({ sourceId: "mage",    targetId: "gobelin", amount: 10 })
        expect(damageLogs[1]).toMatchObject({ sourceId: "gobelin", targetId: "mage",    amount: 3 })

        expect(damageLogs.some(l => l.amount === 100)).toBe(false)
    })

    it("ignore les passifs modificateurs lors de la résolution des réactions", () => {
        const basicAttack: Action = {
            id: "basic_attack",
            type: "attack",
            processorConfigs: [
                { type: "compute_damage", order: 1, params: { damageValue: 10 } },
                { type: "apply_damage", order: 1, params: {} }
            ]
        }

        const damageReductionPassive: ModifierPassive = {
            kind: "MODIFIER",
            id: "damage_reduction",
            config: permanentConfig,
            modifier: "damageReductionModifier",
            value: -20
        }

        const actionRegistry: IActionRegistry = {
            get: (id) => {
                if (id === "basic_attack") return basicAttack
                throw new Error(`Action ${id} not found`)
            }
        }

        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({
            id: "gobelin",
            teamId: "ENEMY",
            activePassives: [buildActivePassive(damageReductionPassive, "gobelin")]
        })

        const fightContext = buildFightContext([mage], [gobelin])
        const executor = buildExecutor({ actionRegistry })

        const logs = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "basic_attack",
            reactionDepth: 0
        }, fightContext)

        const damageLogs = logs.filter(l => l.type === "damage_dealt")

        expect(damageLogs).toHaveLength(1)
        expect(damageLogs[0]).toMatchObject({
            sourceId: "mage",
            targetId: "gobelin"
        })
    })

    it("avorte l'action et signale l'échec (action_failed) si l'énergie est insuffisante", () => {
        const costlyAction: Action = {
            id: "costly",
            type: "attack",
            processorConfigs: [
                { type: "check_energy", order: 1, params: { neededEnergy: 20 } },
                { type: "use_energy", order: 2, params: {} },
                { type: "compute_damage", order: 3, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 4, params: {} }
            ]
        }

        const executor = buildExecutor({ actionRegistry: { get: () => costlyAction } })

        // énergie par défaut = 10 < 20 requis
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({ id: "gobelin", teamId: "ENEMY" })
        const fightContext = buildFightContext([mage], [gobelin])

        const { logs, executed } = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "costly",
            reactionDepth: 0
        }, fightContext)

        expect(executed).toBe(false)
        expect(logs.some(l => l.type === "damage_dealt")).toBe(false)
        expect(logs.find(l => l.type === "action_failed")).toMatchObject({
            type: "action_failed",
            reason: "not_enough_energy"
        })
    })

    it("exécute et consomme l'énergie (updated_energy) si elle est suffisante", () => {
        const costlyAction: Action = {
            id: "costly",
            type: "attack",
            processorConfigs: [
                { type: "check_energy", order: 1, params: { neededEnergy: 5 } },
                { type: "use_energy", order: 2, params: {} },
                { type: "compute_damage", order: 3, params: { initialDamage: 10 } },
                { type: "apply_damage", order: 4, params: {} }
            ]
        }

        const executor = buildExecutor({ actionRegistry: { get: () => costlyAction } })

        // énergie par défaut = 10 >= 5 requis
        const mage = buildPlayingEntity({ id: "mage", teamId: "PLAYER" })
        const gobelin = buildPlayingEntity({ id: "gobelin", teamId: "ENEMY" })
        const fightContext = buildFightContext([mage], [gobelin])

        const { logs, executed } = executor.execute({
            type: "action",
            casterId: "mage",
            targetId: "gobelin",
            actionId: "costly",
            reactionDepth: 0
        }, fightContext)

        expect(executed).toBe(true)
        expect(logs.some(l => l.type === "damage_dealt")).toBe(true)
        expect(logs.find(l => l.type === "updated_energy")).toMatchObject({
            type: "updated_energy",
            updatedValue: 5
        })
    })
})